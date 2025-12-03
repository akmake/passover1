import express from 'express';
import { createOrder, getMyOrders, getOrderByIdForUser } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { orderSchema } from '../utils/validationSchemas.js';
import { generalApiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.route('/').post(requireAuth, generalApiLimiter, validate(orderSchema), createOrder);
router.route('/myorders').get(requireAuth, generalApiLimiter, getMyOrders);
router.route('/:id').get(requireAuth, generalApiLimiter, getOrderByIdForUser);
export default router;