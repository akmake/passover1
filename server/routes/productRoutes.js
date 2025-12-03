import express from 'express';
import { getPublicProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - נתיב ציבורי לשליפת כל המוצרים לתפריט
router.get('/', getPublicProducts);

// GET /api/products/:id - נתיב ציבורי לשליפת מוצר ספציפי
router.get('/:id', getProductById);

export default router;