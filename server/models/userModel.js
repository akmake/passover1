import mongoose from 'mongoose';

// ... (schemas for cartItem and shippingDetails remain the same) ...
const shippingDetailsSchema = new mongoose.Schema({
    customerName: { type: String },
    phone: { type: String },
    city: { type: String },
    streetAddress: { type: String },
    apartment: { type: String },
    floor: { type: String },
}, { _id: false });

const cartItemSchema = new mongoose.Schema({
    itemType: { type: String, required: true, enum: ['Product', 'MealPackage'] },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'cart.itemType' },
    quantity: { type: Number, min: 1 },
    packageSelections: [{
        category: String,
        selectedOptions: [{ _id: mongoose.Schema.Types.ObjectId, name: String }]
    }]
}, { _id: false });


const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: [cartItemSchema],
    shippingDetails: { type: shippingDetailsSchema },

    // --- שדה חדש ---
    redeemedCoupons: [{
        type: String // We will store the coupon CODE here for easy checking
    }],

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    mfaSecret: { type: String, select: false },  // <-- שינוי חדש: לשמירת secret מ-speakeasy
    mfaEnabled: { type: Boolean, default: false },  // <-- שינוי חדש
}, { timestamps: true });


// ... (virtuals and methods remain the same) ...
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