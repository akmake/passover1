// server/controllers/packageController.js

import MealPackage from '../models/mealPackageModel.js';

// @desc    Fetch all active meal packages for public view
// @route   GET /api/packages
// @access  Public
export const getPublicPackages = async (req, res) => {
    try {
        // שולפים את החבילות הפעילות
        const packages = await MealPackage.find({ isActive: true });

        // --- תיקון: שליחת הנתונים הגולמיים (Raw) ---
        // אנחנו שולחים את האובייקט המלא (עם he ו-en) כדי שהקליינט יחליט מה להציג
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch a single meal package for public view
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = async (req, res) => {
    try {
        const mealPackage = await MealPackage.findById(req.params.id)
            // שליפת המידע המלא על המוצרים הקשורים
            .populate('fixedItems.product')
            .populate('choiceRules.options');

        if (mealPackage) {
            // --- תיקון: ביטול הלוקליזציה בשרת ---
            // במקום להשתמש ב-localizeFields ולכפות שפה,
            // אנחנו מחזירים את האובייקט המקורי.
            // הקליינט (PackageBuilderPage) כבר מכיל לוגיקה שיודעת לקחת את השפה הנכונה:
            // pkg.name?.[currentLang] || pkg.name?.he
            
            res.json(mealPackage);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};