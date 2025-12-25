import mongoose from 'mongoose';

const homePageConfigSchema = new mongoose.Schema({
  // --- Hero Section המשודרג ---
  hero: {
    height: { type: Number, default: 95 }, // גובה ב-vh
    interval: { type: Number, default: 5 }, // זמן החלפה בשניות
    slides: [
      {
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        url: { type: String, required: true }, // הנתיב לקובץ שהעלית
        poster: { type: String }, // תמונת גיבוי לוידאו
        title: { type: String },
        subtitle: { type: String },
        buttonText: { type: String },
        link: { type: String }
      }
    ]
  },

  // --- קטגוריות ---
  categories: [
    {
      title: { type: String },
      hebrewTitle: { type: String },
      subtitle: { type: String },
      image: { type: String },
      link: { type: String }
    }
  ],

  // --- מוצרים נבחרים ---
  featured: {
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    rotationSpeed: { type: Number, default: 5 }
  }

}, { timestamps: true });

// יצירת הגדרות ברירת מחדל אם אין
homePageConfigSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) return settings;
  
  return await this.create({
    hero: {
        height: 95,
        interval: 6,
        slides: []
    },
    categories: [],
    featured: { productIds: [] }
  });
};

const HomePageConfig = mongoose.model('HomePageConfig', homePageConfigSchema);
export default HomePageConfig;