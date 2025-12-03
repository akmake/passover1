import express from 'express';
import { getPublicSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Public route to get settings for the checkout page etc.
router.get('/public', getPublicSettings);

export default router;