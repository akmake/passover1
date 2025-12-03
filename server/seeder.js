import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// טוען את נתוני המוצרים
import products from './data/products.js'; 
// טוען את המודל
import Product from './models/productModel.js'; 

// הגדרת נתיבים כדי למצוא את .env בטוח
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// טעינת משתני הסביבה (בשביל החיבור למונגו)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const importData = async () => {
  try {
    // התחברות לדאטה בייס
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 MongoDB Connected');

    // 1. מחיקת כל המוצרים הקיימים (כדי למנוע כפילויות)
    await Product.deleteMany();
    console.log('🗑️  Old products removed');

    // 2. הכנסת המוצרים החדשים
    await Product.insertMany(products);
    console.log('✅ Data Imported Successfully!');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// הפעלת הפונקציה
importData();