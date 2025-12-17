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
      
      // עדכון ה-Enum לקטגוריות החדשות
      category: { 
        type: String, 
        required: true, 
        enum: [
          'furniture',
          'lighting',
          'textiles',
          'decor',
          'art',
          'scents',
          'kitchen'
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