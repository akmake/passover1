import express from 'express';
import upload from '../utils/upload.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// נתיב להעלאת תמונות - מוגן למנהלים בלבד
router.post('/', requireAuth, requireAdmin, upload.array('images', 5), (req, res) => {
  // בדיקה אם הועלו קבצים
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'Please upload at least one file.' });
  }

  // Cloudinary שומר את הכתובת המלאה (URL) בתוך file.path
  // אנחנו ממפים את המערך כדי להחזיר רק את הכתובות
  const filePaths = req.files.map(file => file.path);

  // החזרת תשובה ללקוח עם הקישורים
  res.status(201).send({
    message: 'Images uploaded successfully',
    images: filePaths, 
  });
});

export default router;