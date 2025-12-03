import mongoose from 'mongoose';

const homepageSettingsSchema = new mongoose.Schema({
  identifier: {
    type: String,
    default: 'main-settings',
    unique: true,
  },
  sections: [
    {
      type: {
        type: String,
        required: true,
        enum: ['hero', 'features', 'categoryGrid', 'richText', 'imageWithText'],
      },
      // --- התיקון כאן ---
      // הוספנו שדה גובה מספרי לכל בלוק
      height: {
        type: Number,
      },
      // --- סוף התיקון ---
      content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    },
  ],
}, { timestamps: true });

const HomepageSettings =
      mongoose.models.HomepageSettings ||
      mongoose.model('HomepageSettings', homepageSettingsSchema);

export default HomepageSettings;