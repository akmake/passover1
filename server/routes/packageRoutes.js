import express from 'express';
import { getPackageById, getPublicPackages } from '../controllers/packageController.js';

const router = express.Router();

// GET /api/packages - נתיב ציבורי חדש לשליפת כל החבילות
router.get('/', getPublicPackages);

// GET /api/packages/:id - נתיב ציבורי לשליפת חבילה ספציפית
router.get('/:id', getPackageById);

export default router;