import mongoose from 'mongoose';

// 1. יצרנו תבנית קטנה עבור שדה טקסט שצריך להיות דו-לשוני
const localizedStringSchema = {
  he: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

const productSchema = new mongoose.Schema(
    {
      // 2. השתמשנו בתבנית החדשה עבור השדות "name" ו-"description"
      name: { type: localizedStringSchema, required: true },
      description: { type: localizedStringSchema },

      // --- כל שאר השדות נשארו ללא שינוי ---
      price: { type: Number, required: [true, 'מחיר הוא שדה חובה'], min: 0 },
      image: { type: String, required: false },
      category: { 
        type: String, 
        required: true, 
        enum: [
          'main_course',    // עיקריות
          'side_dish',      // תוספות
          'salad',          // סלטים
          'dessert',        // קינוחים ועוגות
          'drink',          // שתיה (מהמערכת הקיימת)
          'fish',           // דגים (חדש)
          'appetizer',      // ביניים (חדש)
          'soup',           // מרק (חדש)
          'seder_plate',    // קערת ליל סדר (חדש)
          'dairy'           // חלבי (חדש)
        ] 
      },
      kashrut: { type: String, required: true, enum: ['parve', 'dairy', 'meat'] },
      sku: { type: String, trim: true, unique: true, sparse: true },
      unitType: { 
        type: String, 
        required: [true, 'סוג יחידה הוא שדה חובה'], 
        trim: true, 
        enum: ['יחידה', 'גרם', 'ק"ג', 'מ"ל', 'ליטר'] 
      },
      unitAmount: {
        type: Number,
        required: false,
        min: 0
      },
      isActive: { type: Boolean, default: true },
      isGlutenFree: {
      type: Boolean,
      default: false,
      description: 'האם המוצר ללא גלוטן?'
    }
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;