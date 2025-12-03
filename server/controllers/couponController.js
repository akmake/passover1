import Coupon from '../models/couponModel.js';
import User from '../models/userModel.js';

export const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id); // דורש שהמשתמש יהיה מחובר

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // --- בדיקות חדשות ---
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'קוד קופון לא תקין או לא פעיל' });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(410).json({ message: 'פג תוקפו של קופון זה' });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'קופון זה הגיע למגבלת המימושים הכללית' });
    }
    
    const userUsedCount = coupon.usersWhoUsed.filter(userId => userId.equals(user._id)).length;
    if (coupon.maxUsesPerUser !== null && userUsedCount >= coupon.maxUsesPerUser) {
        return res.status(400).json({ message: 'כבר ניצלת את הקופון הזה את הכמות המירבית של פעמים' });
    }
    // --- סוף בדיקות חדשות ---

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};