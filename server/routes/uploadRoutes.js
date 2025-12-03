import express from 'express';
import upload from '../utils/upload.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'Please upload at least one file.' });
  }
  
  // Return the paths of the uploaded files
  const filePaths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
  res.status(201).send({
    message: 'Images uploaded successfully',
    images: filePaths,
  });
});

export default router;