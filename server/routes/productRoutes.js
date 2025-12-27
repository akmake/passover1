import express from 'express';
// ייבוא כל הפונקציות מהקונטרולר המעודכן
import { 
  getPublicProducts, 
  getProductById, 
  createProduct, 
  deleteProduct 
} from '../controllers/productController.js';
// ייבוא המידלוור לאבטחה
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. נתיבים ציבוריים (פתוחים לכולם)
router.get('/', getPublicProducts);
router.get('/:id', getProductById);

// 2. נתיבים מוגנים (רק למנהלים מחוברים)
// זה הנתיב שפתר את שגיאת ה-404 שלך:
router.post('/', requireAuth, requireAdmin, createProduct);

// נתיב למחיקת מוצר
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;