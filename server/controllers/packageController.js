// server/controllers/packageController.js

import MealPackage from '../models/mealPackageModel.js';
import { localizeFields } from '../utils/localize.js'; // <-- 1. מייבאים את "המתרגם"

// @desc    Fetch all active meal packages for public view
// @route   GET /api/packages
// @access  Public
export const getPublicPackages = async (req, res) => {
    try {
        const packages = await MealPackage.find({ isActive: true });
        
        // 2. מתרגמים את החבילות לשפה הנכונה
        const localizedPackages = packages.map(p => localizeFields(p, req.language));

        res.json(localizedPackages);
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
            .populate('fixedItems.product', 'name price')
            .populate('choiceRules.options', 'name price');
            
        if (mealPackage) {
            // 3. מתרגמים גם את החבילה הבודדת וגם את המוצרים שבתוכה
            const localizedPackage = localizeFields(mealPackage, req.language);
            localizedPackage.fixedItems = localizedPackage.fixedItems.map(item => ({
                ...item,
                product: localizeFields(item.product, req.language)
            }));
            localizedPackage.choiceRules = localizedPackage.choiceRules.map(rule => ({
                ...rule,
                options: rule.options.map(opt => localizeFields(opt, req.language))
            }));

            res.json(localizedPackage);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};