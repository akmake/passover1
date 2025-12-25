import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import connectDB from './config/db.js';

// --- הגדרות המנהל ---
const adminConfig = {
  name: 'Admin User',
  email: 'yosefdaean@gmail.com', // האימייל שלך
  password: '0546205955'          // הסיסמה החדשה
};

// טעינת משתני סביבה
dotenv.config();

const createOrUpdateAdmin = async () => {
  try {
    // 1. חיבור למסד הנתונים באמצעות הקונפיגורציה הקיימת של הפרויקט
    await connectDB();

    // 2. בדיקה אם המשתמש קיים
    const existingUser = await User.findOne({ email: adminConfig.email });

    // הצפנת הסיסמה (מותאם ל-authController שלך עם Salt 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminConfig.password, salt);

    if (existingUser) {
      console.log('⚠️ משתמש עם אימייל זה כבר קיים.');
      
      // עדכון פרטים למשתמש קיים (שדרוג לניהול + איפוס סיסמה)
      existingUser.name = adminConfig.name;
      existingUser.passwordHash = passwordHash;
      existingUser.role = 'admin';
      
      // איפוס מונים למקרה שהמשתמש נעול
      existingUser.failedLoginAttempts = 0;
      existingUser.lockUntil = null;

      await existingUser.save();
      console.log('✅ המשתמש עודכן בהצלחה: סיסמה אופסה והוגדר כמנהל.');
    } else {
      // יצירת משתמש חדש
      console.log('🔨 יוצר משתמש מנהל חדש...');
      
      const newAdmin = new User({
        name: adminConfig.name,
        email: adminConfig.email,
        passwordHash: passwordHash,
        role: 'admin',
        // שדות אופציונליים במודל שלך - אין חובה למלא אותם למנהל
        cart: [],
        shippingDetails: {
            customerName: adminConfig.name,
            phone: '0000000000',
            city: 'Admin City',
            streetAddress: 'Admin HQ'
        }
      });

      await newAdmin.save();
      console.log('🎉 משתמש מנהל נוצר בהצלחה!');
    }

    console.log(`
---------------------------------------
👤 משתמש: ${adminConfig.email}
🔑 סיסמה: ${adminConfig.password}
👑 תפקיד: Admin
---------------------------------------
    `);

    process.exit(0);

  } catch (error) {
    console.error('❌ שגיאה ביצירת מנהל:', error.message);
    process.exit(1);
  }
};

createOrUpdateAdmin();