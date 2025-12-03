import express from 'express';
import upload from '../utils/upload.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'Please upload at least one file.' });
  }

  const filePaths = req.files.map(file => `/uploads/${file.filename}`);

  res.status(201).send({
    message: 'Images uploaded successfully',
    images: filePaths, // זה מה שנשמר ב-DB בסופו של דבר
  });
});

export default router;