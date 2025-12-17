import mongoose from 'mongoose';

const localizedStringSchema = {
  he: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

const productSchema = new mongoose.Schema(
    {
      name: { type: localizedStringSchema, required: true },
      description: { type: localizedStringSchema },
      price: { type: Number, required: true, min: 0 },
      image: { type: String, required: false },
      
      // קטגוריות מעודכנות למוצרי יוקרה
      category: { 
        type: String, 
        required: true, 
        enum: [
          'watches',
          'jewelry',
          'perfumes',
          'leather_goods',
          'gift_sets',
          'exclusive'
        ] 
      },
      
      // שדות טכניים
      sku: { type: String, trim: true, unique: true, sparse: true },
      isActive: { type: Boolean, default: true },
      isPopular: { type: Boolean, default: false }, // הוספתי שדה לפריטים פופולריים
      stock: { type: Number, default: 10 } // ניהול מלאי בסיסי
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;