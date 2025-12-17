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
      
      // כאן התיקון! רשימת הקטגוריות המעודכנת
      category: { 
        type: String, 
        required: true, 
        enum: [
          'flowers',    // פרחים
          'gifts',      // מתנות
          'dinnerware', // כלי אוכל/בריליאנט
          'chocolate',  // שוקולד
          'decor',      // עיצוב
          'packages'    // חבילות/מארזים
        ] 
      },
      
      sku: { type: String, trim: true, unique: true, sparse: true },
      isActive: { type: Boolean, default: true },
      isPopular: { type: Boolean, default: false },
      stock: { type: Number, default: 50 }
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;