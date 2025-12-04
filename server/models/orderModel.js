import mongoose from 'mongoose';

// סכמה לטקסט רב-לשוני
const localizedStringSchema = {
    he: { type: String, default: '' },
    en: { type: String, default: '' }
};

const shippingDetailsSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartment: { type: String },
    floor: { type: String },
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
    // --- השינוי: השם נשמר כאובייקט שפות ---
    name: localizedStringSchema,
    price: { type: Number, required: true },
    itemType: { type: String, required: true, enum: ['Product', 'MealPackage'] },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'orderItems.itemType' },
    quantity: { type: Number },
    packageSelections: [{
        category: String,
        selectedOptions: [{ 
            _id: mongoose.Schema.Types.ObjectId, 
            // --- השינוי: גם כאן ---
            name: localizedStringSchema 
        }]
    }]
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [orderItemSchema],
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalPrice: { type: Number, required: true, default: 0.0 },
    status: {
        type: String,
        required: true,
        enum: ['התקבלה', 'בטיפול המטבח', 'מוכנה למשלוח', 'בדרך ללקוח', 'נמסרה', 'בוטלה'],
        default: 'התקבלה'
    },
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
    },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;