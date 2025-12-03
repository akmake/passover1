import mongoose from 'mongoose';

// ... (orderItemSchema and shippingDetailsSchema remain the same) ...
const shippingDetailsSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartment: { type: String },
    floor: { type: String },
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    itemType: { type: String, required: true, enum: ['Product', 'MealPackage'] },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'orderItems.itemType' },
    quantity: { type: Number },
    packageSelections: [{
        category: String,
        selectedOptions: [{ _id: mongoose.Schema.Types.ObjectId, name: String }]
    }]
});


const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [orderItemSchema],
    
    // --- שדות חדשים/מעודכנים ---
    itemsPrice: { type: Number, required: true }, // מחיר הפריטים לפני הנחות ומשלוח
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 }, // סכום ההנחה
    couponCode: { type: String }, // קוד הקופון שמומש
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    status: {
    type: String,
    required: true,
    enum: ['התקבלה', 'בטיפול המטבח', 'מוכנה למשלוח', 'בדרך ללקוח', 'נמסרה', 'בוטלה'],
    default: 'התקבלה' },
    shippingDetails: { type: shippingDetailsSchema, required: true },
    deliveryDate: { type: String, required: true },
    notes: { type: String },
    fulfillmentType: {
      type: String,
      required: true,
      enum: ['Delivery', 'Pickup'],
    },
    fulfillmentDetails: {
      type: String,
      required: true,
      description: "שם אזור המשלוח או נקודת האיסוף",
    },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;