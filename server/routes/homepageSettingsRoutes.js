import express from 'express';
import { getHomepageSettings } from '../controllers/homepageSettingsController.js';

const router = express.Router();

// Public route to get settings for the homepage
router.get('/', getHomepageSettings);

export default router;