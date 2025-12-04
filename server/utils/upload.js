import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// טעינת משתני סביבה כדי לגשת למפתחות
dotenv.config();

// הגדרת החיבור ל-Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// הגדרת האחסון - העלאה ישירה לתיקייה בענן
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'passover-catering', // השם של התיקייה שתיווצר בתוך Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// מסנן קבצים - מוודא שמעלים רק תמונות
const fileFilter = (req, file, cb) => {
    // בדיקה שהקובץ הוא תמונה
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('רק קבצי תמונה מותרים! (jpeg, jpg, png, gif, webp)'), false);
    }
};

// הגדרת ה-Multer עם ההגדרות של Cloudinary
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // מגבלה של 5 מגה לקובץ
});

export default upload;