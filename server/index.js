import dotenv from 'dotenv';
// טעינת הגדרות מקומיות אם קיימות
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

// התחברות למסד הנתונים
connectDB();

// Render נותן פורט משלו, או שנשתמש ב-5000 כברירת מחדל
const port = process.env.PORT || 5000;

// הפעלת השרת
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (logger) {
        logger.info(`Server is listening on port ${port}`);
    }
});