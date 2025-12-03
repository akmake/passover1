import mongoose from 'mongoose';

const generalSettingsSchema = new mongoose.Schema({
  // מזהה קבוע כדי שתמיד תהיה רק רשומת הגדרות אחת
  identifier: {
    type: String,
    default: 'main',
    unique: true,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 2000,
  },
}, { timestamps: true });

const GeneralSettings = mongoose.models.GeneralSettings || mongoose.model('GeneralSettings', generalSettingsSchema);

export default GeneralSettings;