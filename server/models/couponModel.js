import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    // --- שדות חדשים ---
    maxUses: { // הגבלה כללית
      type: Number,
      default: null, // null = ללא הגבלה
    },
    usedCount: { // מונה שימושים כללי
      type: Number,
      default: 0,
    },
    maxUsesPerUser: { // הגבלה למשתמש
      type: Number,
      default: 1, // ברירת מחדל למימוש יחיד
    },
    usersWhoUsed: [{ // מערך למעקב אחר המשתמשים שניצלו
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;