import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/userModel.js';

// --- הגדרות המנהל החדש (שנה את זה למה שאתה רוצה) ---
const adminName = 'Admin User';
const adminEmail = 'yosefdaean@gmail.com';
const adminPassword = '0546205955'; // עכשיו זה יעבוד גם עם סיסמה פשוטה
// ----------------------------------------------------

// הגדרת נתיבים לטעינת משתני הסביבה (.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const createAdmin = async () => {
  try {
    // בדיקת חיבור למסד הנתונים
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI חסר בקובץ .env');
    }

    console.log('🔗 מתחבר ל-MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ מחובר.');

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('⚠️ משתמש עם אימייל זה כבר קיים.');
      if (existingUser.role === 'admin') {
        console.log('✅ והוא כבר מוגדר כמנהל.');
      } else {
        console.log('🔄 מעדכן אותו למנהל...');
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ עודכן בהצלחה.');
      }
      process.exit(0);
    }

    // יצירת משתמש חדש
    console.log('🔨 יוצר משתמש מנהל חדש...');

    // הצפנת הסיסמה (חובה, כי המודל מצפה ל-passwordHash)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      name: adminName,
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'admin', // <-- כאן הקסם קורה
      shippingDetails: { // שדות חובה למניעת שגיאות ולידציה עתידיות
        customerName: adminName,
        phone: '054',
        city: 'Tel Aviv',
        streetAddress: 'Admin St',
      }
    });

    await newAdmin.save();

    console.log(`
🎉 נוצר בהצלחה!
👤 שם: ${adminName}
📧 אימייל: ${adminEmail}
🔑 סיסמה: ${adminPassword}
👑 תפקיד: Admin
    `);

    process.exit(0);

  } catch (error) {
    console.error('❌ שגיאה:', error);
    process.exit(1);
  }
};

createAdmin();