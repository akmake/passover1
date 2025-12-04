import mongoose from 'mongoose';

// סכמה פנימית לפרטי משלוח
const shippingDetailsSchema = new mongoose.Schema({
    customerName: { type: String },
    phone: { type: String },
    city: { type: String },
    streetAddress: { type: String },
    apartment: { type: String },
    floor: { type: String },
}, { _id: false });

// סכמה פנימית לפריט בעגלה
const cartItemSchema = new mongoose.Schema({
    itemType: { type: String, required: true, enum: ['Product', 'MealPackage'] },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'cart.itemType' },
    quantity: { type: Number, min: 1 },
    packageSelections: [{
        category: String,
        selectedOptions: [{ 
            _id: mongoose.Schema.Types.ObjectId, 
            // --- השינוי: תמיכה בשם רב-לשוני גם בתוך העגלה ---
            name: { 
                he: { type: String, default: '' },
                en: { type: String, default: '' }
            } 
        }]
    }]
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: [cartItemSchema],
    shippingDetails: { type: shippingDetailsSchema },
    redeemedCoupons: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    mfaSecret: { type: String, select: false },
    mfaEnabled: { type: Boolean, default: false },
}, { timestamps: true });

// וירטואלים ומתודות (ללא שינוי)
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incrementLoginAttempts = function () {
    const MAX_FAILED_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000;
    if (this.isLocked) return;
    const updates = { $inc: { failedLoginAttempts: 1 } };
    if (this.failedLoginAttempts + 1 >= MAX_FAILED_LOGIN_ATTEMPTS) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
    if (this.failedLoginAttempts > 0 || this.lockUntil) {
        return this.updateOne({ $set: { failedLoginAttempts: 0, lockUntil: null } });
    }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;