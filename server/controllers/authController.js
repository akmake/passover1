import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { createAndSendTokens } from '../utils/tokenHandler.js';
import sendEmail from '../utils/sendEmail.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) { return res.status(400).json({ message: 'שם, אימייל וסיסמה הם שדות חובה' }); }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) { return res.status(409).json({ message: 'משתמש עם כתובת אימייל זו כבר קיים' }); }

        // --- THE FIX IS HERE ---
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // -------------------------

        if (!strongPasswordRegex.test(password)) { return res.status(400).json({ message: 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד.' }); }
        
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, passwordHash });

        createAndSendTokens(newUser, res);
        
        // We are sending tokens via cookies, so the JSON response is for client-side state update.
        const userResponse = { 
            _id: newUser._id, 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role, 
            shippingDetails: newUser.shippingDetails 
        };

        try {
            await sendEmail({
                email: newUser.email,
                subject: 'ברוך הבא לקייטרינג פלוס!',
                message: `שלום ${newUser.name},\n\nשמחים שהצטרפת אלינו לקייטרינג פלוס.\nכעת תוכל להרכיב את ארוחת החג המושלמת שלך בקלות ובנוחות.\n\nבברכה,\nצוות קייטרינג פלוס`
            });
        } catch (emailError) {
            console.error('שליחת מייל הרשמה נכשלה, אך המשתמש נוצר בהצלחה:', emailError);
        }
        
        // Send the JSON response after setting cookies.
        res.status(201).json(userResponse);

    } catch (error) { 
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'אירעה שגיאה בשרת בעת ההרשמה' }); 
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password, otp } = req.body;
        if (!email || !password) { return res.status(400).json({ message: 'אימייל וסיסמה הם שדות חובה' }); }
        
        const user = await User.findOne({ email }).select('+passwordHash +mfaSecret');
        
        if (user && user.isLocked) { return res.status(403).json({ message: 'החשבון נעול זמנית. נסה שוב בעוד 15 דקות.' }); }
        
        const isMatch = user && (await bcrypt.compare(password, user.passwordHash));
        if (!isMatch) {
            user && await user.incrementLoginAttempts();
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
        }
        
        if (user.mfaEnabled) {
            if (!otp) {
                return res.status(401).json({ mfaRequired: true, message: 'נדרש קוד MFA' });
            }
            const verified = speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token: otp,
            });
            if (!verified) {
                return res.status(401).json({ message: 'קוד MFA שגוי' });
            }
        }
        
        await user.resetLoginAttempts();
        createAndSendTokens(user, res);

        res.status(200).json({ 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            shippingDetails: user.shippingDetails 
        });

    } catch (error) { res.status(500).json({ message: 'אירעה שגיאה בשרת בעת ההתחברות' }); }
};

export const logoutUser = async (req, res) => {
    try {
        // מצא את המשתמש והגדל את tokenVersion
        const user = await User.findById(req.user._id);
        if (user) {
            user.tokenVersion += 1;
            await user.save();
        }

        // נקה את העוגיות
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'test',
            sameSite: 'strict'
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'test',
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

export const refreshToken = async (req, res) => {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');

        if (!user || user.tokenVersion !== decoded.version) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // צור טוקנים חדשים
        createAndSendTokens(user, res);
        res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'אם האימייל קיים, נשלחה אליו הודעה לאיפוס סיסמה.' });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 דקות
        await user.save();
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const message = `קיבלת אימייל זה כי התקבלה בקשה לאיפוס סיסמה עבור חשבונך.\n\nאנא לחץ על הקישור הבא, או הדבק אותו בדפדפן כדי להשלים את התהליך:\n\n${resetUrl}\n\nאם לא ביקשת זאת, אנא התעלם מאימייל זה והסיסמה שלך תישאר ללא שינוי.`;
        await sendEmail({
            email: user.email,
            subject: 'איפוס סיסמה - קייטרינג פלוס',
            message: message,
        });
        res.status(200).json({ message: 'אם האימייל קיים, נשלחה אליו הודעה לאיפוס סיסמה.' });
    } catch (error) {
        console.error(error);
        res.status(200).json({ message: 'אם האימייל קיים, נשלחה אליו הודעה לאיפוס סיסמה.' });
    }
};

export const resetPassword = async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: 'הקישור לאיפוס סיסמה אינו תקין או שפג תוקפו.' });
        }
        const { password } = req.body;
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'הסיסמה אופסה בהצלחה. ניתן כעת להתחבר עם הסיסמה החדשה.' });
    } catch (error) {
        res.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};

export const enableMfa = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'רק מנהלים יכולים להפעיל MFA' });
        }
        const secret = speakeasy.generateSecret({ name: `Catering Passover (${req.user.email})` });
        await User.findByIdAndUpdate(req.user._id, {
            mfaSecret: secret.base32,
            mfaEnabled: true,
        });
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'שגיאה ביצירת קוד QR' });
            }
            res.json({ qrCode: data_url });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
};
