const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'נא להזין שם קטגוריה'],
    unique: true, // שלא יהיו כפילויות
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: { // אופציונלי: כדי לקבוע סדר הופעה באתר
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);