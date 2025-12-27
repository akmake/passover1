import express from 'express';
import Promotion from '../models/Promotion.js';

const router = express.Router();

// שליפת כל המבצעים
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().populate('product');
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// הוספת מבצע
router.post('/', async (req, res) => {
  const { productId, discountPrice } = req.body;
  
  const promotion = new Promotion({
    product: productId,
    discountPrice: discountPrice
  });

  try {
    const newPromotion = await promotion.save();
    await newPromotion.populate('product'); 
    res.status(201).json(newPromotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// מחיקת מבצע
router.delete('/:id', async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;