import mongoose from 'mongoose';

// יצרנו תבנית קטנה עבור שדה טקסט שצריך להיות דו-לשוני
const localizedStringSchema = {
  he: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

const choiceRuleSchema = new mongoose.Schema({ // <-- שם התבנית הוא choiceRuleSchema
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
  
  // -- התיקון נמצא כאן --
  choiceRules: [choiceRuleSchema], // השתמשנו בשם הנכון של התבנית

}, { timestamps: true });

const MealPackage = mongoose.models.MealPackage || mongoose.model('MealPackage', mealPackageSchema);
export default MealPackage;