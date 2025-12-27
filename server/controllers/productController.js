import Product from '../models/productModel.js';

// --- שליפת מוצרים (קיים אצלך) ---
export const getPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- שליפת מוצר לפי מזהה (קיים אצלך) ---
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.isActive) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- יצירת מוצר חדש (הפונקציה שהייתה חסרה!) ---
export const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        // טיפול בשגיאות ולידציה של מונגו (למשל אם חסר שדה חובה)
        res.status(500).json({ message: "שגיאה ביצירת מוצר", error: error.message });
    }
};

// --- מחיקת מוצר (בונוס, שיהיה לך לפאנל ניהול) ---
export const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "המוצר נמחק בהצלחה" });
    } catch (error) {
        res.status(500).json({ message: "שגיאה במחיקת המוצר", error: error.message });
    }
};