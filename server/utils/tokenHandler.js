import jwt from 'jsonwebtoken';

// 1. הארכנו את תוקף הטוקן ל-30 יום (במקום 15 דקות)
const signAccessToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

// 2. גם את ה-Refresh נשאיר ל-30 יום (או אפילו יותר אם תרצה)
const signRefreshToken = (payload) =>
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

export const createAndSendTokens = (user, res) => {
    const accessTokenPayload = { id: user._id, role: user.role };
    const refreshTokenPayload = { id: user._id, version: user.tokenVersion };

    const accessToken = signAccessToken(accessTokenPayload);
    const refreshToken = signRefreshToken(refreshTokenPayload);

    const cookieOptions = {
        httpOnly: true,
        // שים לב: ב-Localhost רגיל (http) זה עלול לעשות בעיות אם אין לך SSL.
        // אם אתה עובד עם ה-https שהגדרנו קודם - זה מצוין.
        // אם אתה רואה שהקוקי לא נשמר, שנה את זה ל: process.env.NODE_ENV === 'production'
        secure: true, 
        sameSite: 'none', 
    };

    // 3. עדכון זמן הקוקי ל-30 יום (במקום 15 דקות)
    res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    });

    res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    });
};