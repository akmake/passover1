import express from 'express';
import { getCart, updateCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// כל הנתיבים כאן מוגנים ודורשים משתמש מחובר
router.route('/').get(requireAuth, getCart).put(requireAuth, updateCart);

export default router;