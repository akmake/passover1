import express from 'express';
import { getPublicDeliveryOptions, getPublicDeliveryDates } from '../controllers/deliveryOptionsController.js';

const router = express.Router();

// GET /api/delivery-options - Public route to fetch all active options
router.get('/', getPublicDeliveryOptions);
router.get('/dates', getPublicDeliveryDates);

export default router;