import mongoose from 'mongoose';

// הגדרת סכמה גמישה יותר לטקסט - אנגלית לא חובה
const localizedStringSchema = {
  he: { type: String, required: true, trim: true },
  en: { type: String, default: '' } // <-- השינוי: לא חובה, ברירת מחדל ריקה
};

const choiceRuleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  quantityToChoose: { type: Number, required: true },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const fixedItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const mealPackageSchema = new mongoose.Schema({
  name: { type: localizedStringSchema, required: true },
  description: { type: localizedStringSchema },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  fixedItems: [fixedItemSchema],
  choiceRules: [choiceRuleSchema], 

}, { timestamps: true });

const MealPackage = mongoose.models.MealPackage || mongoose.model('MealPackage', mealPackageSchema);
export default MealPackage;