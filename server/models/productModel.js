import mongoose from 'mongoose';

const localizedString = {
  he: { type: String, required: true },
  en: { type: String, default: '' }
};

const productSchema = new mongoose.Schema({
  name: localizedString,
  description: localizedString, // תיאור קצר/שיווקי
  details: localizedString,     // הפירוט המעניין שביקשת
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // מפנה למודל הקטגוריות
    required: true
  },
  sku: { type: String, required: true, unique: true },
  isPopular: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;