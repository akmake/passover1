import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

// 1. הגדרת מיקום שמירת הקבצים
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // וודא שהתיקייה קיימת, אם לא - צור אותה (אופציונלי אך מומלץ)
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // יצירת שם קובץ ייחודי + הסיומת המקורית
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// 2. סינון קבצים (מאפשר תמונות ווידאו)
const fileFilter = (req, file, cb) => {
  // רשימת סוגי MIME מותרים
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // נסה להיות גמיש יותר אם ה-MIME TYPE לא מדויק
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
};

// 3. יצירת אובייקט ה-Upload עם הגבלות מתאימות לוידאו
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB - חשוב מאוד לוידאו!
  }
});

/**
 * Route: POST /api/upload
 * מקבל: שדות 'image' או 'video'
 */
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  (req, res) => {
    try {
        const image = req.files?.image?.[0];
        const video = req.files?.video?.[0];

        // אם שום קובץ לא עלה
        if (!image && !video) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        return res.json({
            imageUrl: image ? `/uploads/${image.filename}` : '',
            videoUrl: video ? `/uploads/${video.filename}` : '',
            // תאימות לאחור אם יש קומפוננטות אחרות שמצפות לזה
            images: image ? [`/uploads/${image.filename}`] : [], 
        });
    } catch (error) {
        console.error("Processing error:", error);
        return res.status(500).json({ message: 'Error processing file' });
    }
  }
);

// טיפול בשגיאות של Multer (גודל קובץ וכו')
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Max limit is 200MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
       return res.status(400).json({ message: `Unexpected field: ${err.field}` });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message || 'An unknown error occurred during upload.' });
  }
  next();
});

export default router;