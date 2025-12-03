// server/controllers/productController.js

import Product from '../models/productModel.js';
import { localizeFields } from '../utils/localize.js'; // <-- 1. מייבאים את "המתרגם"

// @desc    Fetch all active products for public view
// @route   GET /api/products
// @access  Public
export const getPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });

        // שלח את המוצרים כמו שהם, ללא תרגום מוקדם
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch a single product by ID for public view
// @route   GET /api/products/:id
// @access  Public
// server/controllers/productController.js

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.isActive) {
            // שלב 1: הסרנו את התרגום המוקדם
            // const localizedProduct = localizeFields(product, req.language);
            
            // שלב 2: שולחים את אובייקט המוצר המקורי כמו שהוא מה-DB
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};