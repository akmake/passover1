import express from 'express';
import { verifyCoupon } from '../controllers/couponController.js';
import { requireAuth } from '../middleware/authMiddleware.js'; // <-- הוספת ייבוא

const router = express.Router();

// הוספנו requireAuth כדי שנדע מי המשתמש שמנסה לממש
router.post('/verify', requireAuth, verifyCoupon);

export default router;