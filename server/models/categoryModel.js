// server/models/categoryModel.js

import mongoose from 'mongoose';

// 1. הגדרת סכמה עבור טקסט דו-לשוני
const localizedStringSchema = {
  he: { type: String, trim: true },
  en: { type: String, trim: true },
};

const categorySchema = new mongoose.Schema(
  {
    // 2. החלת הסכמה הדו-לשונית על שדה השם
    name: { 
      type: localizedStringSchema, 
      required: [true, 'שם הקטגוריה הוא שדה חובה'],
      default: { he: '', en: '' }
    },
    key: {
      type: String,
      required: [true, 'מפתח הקטגוריה הוא שדה חובה'],
      unique: true,
      trim: true,
      description: 'מזהה באנגלית ללא רווחים, למשל: main_course',
    },
    image: {
      type: String,
      required: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      description: 'מספר לקביעת סדר התצוגה, מהנמוך לגבוה',
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
      description: 'האם להציג את הקטגוריה הזו בגלריה בדף הבית',
    },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;