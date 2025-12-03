import Category from '../models/categoryModel.js';

// @desc    Fetch all categories for public view
// @route   GET /api/categories
// @access  Public
export const getPublicCategories = async (req, res) => {
  try {
    // --- THIS IS THE CHANGE ---
    // Find only categories marked to be shown on the homepage
    const categories = await Category.find({ showOnHomepage: true }).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};