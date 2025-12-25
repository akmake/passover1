import express from 'express';
import HomePageConfig from '../models/HomePageConfig.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // ודא שהנתיב נכון אצלך

const router = express.Router();

// 1. קבלת ההגדרות (עבור דף הבית - פתוח לכולם)
router.get('/', async (req, res) => {
  try {
    // שולף את ההגדרות + ממיר את ה-IDs למוצרים אמיתיים (שם, תמונה, מחיר)
    let config = await HomePageConfig.getSettings();
    
    // כאן הקסם: מביא את פרטי המוצרים המלאים
    config = await config.populate('featured.productIds', 'name price image description');
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. עדכון ההגדרות (רק למנהל)
router.put('/', protect, admin, async (req, res) => {
  try {
    const config = await HomePageConfig.findOne();
    if (!config) {
        // אם משום מה לא קיים, ניצור (לא אמור לקרות בגלל getSettings)
        const newConfig = await HomePageConfig.create(req.body);
        return res.json(newConfig);
    }

    // עדכון השדות
    config.categories = req.body.categories || config.categories;
    config.featured = req.body.featured || config.featured;
    
    // עדכון שאר החלקים אם נשלחו
    if(req.body.hero) config.hero = req.body.hero;
    if(req.body.bespoke) config.bespoke = req.body.bespoke;
    if(req.body.footerCta) config.footerCta = req.body.footerCta;

    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;