import express from 'express';
import {
    // Dashboard
    getDashboardStats,

    // Products
    getProducts, createProduct, getProductById, updateProduct, deleteProduct,
    getProductCategoryKeys,

    // Users
    getUsers, deleteUser,

    // Orders
    getOrders, getOrderByIdForAdmin, updateOrderStatus,

    // Meal Packages
    getMealPackages, createMealPackage, getMealPackageById, updateMealPackage, deleteMealPackage,

    // Reports
    getPreparationReport, getDeliveryReport,

    // Categories
    getCategories, createCategory, updateCategory, deleteCategory,

    // Coupons
    getCoupons, createCoupon, getCouponById, updateCoupon, deleteCoupon,

    // General & Delivery Settings
    getGeneralSettings, updateGeneralSettings,
    getDeliveryDates, createDeliveryDate, deleteDeliveryDate,
    getDeliveryCenters, createDeliveryCenter, updateDeliveryCenter, deleteDeliveryCenter

} from '../controllers/adminController.js';

import { updateHomepageSettings } from '../controllers/homepageSettingsController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { adminApiLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

// All routes in this file are protected and require admin access
router.use(requireAuth, requireAdmin, adminApiLimiter);
// --- Dashboard ---
router.get('/stats', getDashboardStats);

// --- Product Management ---
router.route('/products')
    .get(getProducts)
    .post(createProduct);
router.route('/products/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

// --- User Management ---
router.route('/users')
    .get(getUsers);
router.route('/users/:id')
    .delete(deleteUser);

// --- Order Management ---
router.route('/orders')
    .get(getOrders);
router.route('/orders/:id')
    .get(getOrderByIdForAdmin);
router.route('/orders/:id/status')
    .put(updateOrderStatus);

// --- Meal Package Management ---
router.route('/packages')
    .get(getMealPackages)
    .post(createMealPackage);
router.route('/packages/:id')
    .get(getMealPackageById)
    .put(updateMealPackage)
    .delete(deleteMealPackage);

// --- Coupon Management ---
router.route('/coupons')
    .get(getCoupons)
    .post(createCoupon);
router.route('/coupons/:id')
    .get(getCouponById)
    .put(updateCoupon)
    .delete(deleteCoupon);

// --- Reports ---
router.get('/reports/preparation', getPreparationReport);
router.get('/reports/delivery', getDeliveryReport);

// --- Content & Display Management ---
router.get('/product-categories', getProductCategoryKeys);
router.route('/categories')
    .get(getCategories)
    .post(createCategory);
router.route('/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);
router.put('/homepage-settings', updateHomepageSettings);


// --- System Settings (The new unified section) ---

// General settings (free shipping etc.)
router.route('/settings/general')
    .get(getGeneralSettings)
    .put(updateGeneralSettings);

// Global delivery dates
router.route('/settings/delivery-dates')
    .get(getDeliveryDates)
    .post(createDeliveryDate);
router.route('/settings/delivery-dates/:id')
    .delete(deleteDeliveryDate);

// Delivery zones and Pickup points
router.route('/settings/delivery-centers')
    .get(getDeliveryCenters)
    .post(createDeliveryCenter);
router.route('/settings/delivery-centers/:id')
    .put(updateDeliveryCenter)
    .delete(deleteDeliveryCenter);

export default router;

