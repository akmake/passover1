import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// יצירת __dirname (נדרש כי אנחנו ב-ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. הגדרת מיקום שמירה - ישירות לתיקיית הקליינט
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // הולך אחורה מהראוטס -> לשרת -> לרוט -> לקליינט -> פאבליק -> העלאות
    // המבנה הזה מבוסס על הרשימה ששלחת: client/public/uploads
    const uploadPath = path.join(__dirname, '../../client/public/uploads');

    // יוצר את התיקייה אם היא לא קיימת
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// 2. סינון קבצים
// סוגי קבצים מותרים — SVG חסום למניעת XSS
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('סוג קובץ לא מורשה. מותר: JPEG, PNG, GIF, WEBP, MP4, WEBM.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB מקסימום (מספיק לוידאו קצר)
});

// 3. הראוט
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  (req, res) => {
    try {
        const image = req.files?.image?.[0];
        const video = req.files?.video?.[0];

        if (!image && !video) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // מחזיר נתיב שמתחיל ב-/uploads
        // מכיוון שהקובץ בתיקיית public, הדפדפן ימצא אותו מיד בנתיב הזה
        return res.json({
            imageUrl: image ? `/uploads/${image.filename}` : '',
            videoUrl: video ? `/uploads/${video.filename}` : '',
            images: image ? [`/uploads/${image.filename}`] : [], 
        });
    } catch (error) {
        console.error("Processing error:", error);
        return res.status(500).json({ message: 'Error processing file' });
    }
  }
);

// טיפול בשגיאות
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

export default router;