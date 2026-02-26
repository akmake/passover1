import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import MealPackage from '../models/mealPackageModel.js';
import DeliveryCenter from '../models/deliveryCenterModel.js';
import Category from '../models/categoryModel.js';
import Coupon from '../models/couponModel.js';
import DeliveryDate from '../models/deliveryDateModel.js';
import GeneralSettings from '../models/generalSettingsModel.js';

// --- General Stats ---
export const getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        res.json({ users: userCount, products: productCount, orders: orderCount });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Product Management ---
export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const filter = search ? {
            $or: [
                { 'name.he': { $regex: search, $options: 'i' } },
                { 'name.en': { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ]
        } : {};

        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, ...otherFields } = req.body;
        
        // בנייה מחדש ואחראית של אובייקט המוצר
        const productData = {
            ...otherFields,
            name: {
                he: name?.he || '',
                en: name?.en || '',
            },
            description: {
                he: description?.he || '',
                en: description?.en || '',
            },
        };

        const product = new Product(productData);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ message: messages });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: `מוצר עם המק"ט שהוזן כבר קיים.` });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) { res.json(product); } else { res.status(404).json({ message: 'Product not found' }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const updateProduct = async (req, res) => {
    try {
        const { name, description, ...otherFields } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            Object.assign(product, otherFields);
            product.name = {
                he: name?.he !== undefined ? name.he : product.name.he,
                en: name?.en !== undefined ? name.en : product.name.en,
            };
            product.description = {
                he: description?.he !== undefined ? description.he : product.description.he,
                en: description?.en !== undefined ? description.en : product.description.en,
            };
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ message: messages });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: `מוצר עם המק"ט שהוזן כבר קיים.` });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else { res.status(404).json({ message: 'Product not found' }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- User Management ---
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({}).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments()
        ]);

        res.json({
            users,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) { return res.status(400).json({ message: 'Admin cannot delete their own account' }); }
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else { return res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Order Management ---
export const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({}).populate('user', 'id name').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments()
        ]);

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Meal Package Management ---
export const getMealPackages = async (req, res) => {
    try {
        const packages = await MealPackage.find({});
        res.json(packages);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const createMealPackage = async (req, res) => {
    try {
        // ולידציה בסיסית לפני הניסיון לשמור
        const { name, description, ...rest } = req.body;
        
        const packageData = {
            ...rest,
            name: {
                he: name?.he || '',
                en: name?.en || ''
            },
            description: {
                he: description?.he || '',
                en: description?.en || ''
            }
        };

        const newPackage = new MealPackage(packageData);
        const savedPackage = await newPackage.save();
        res.status(201).json(savedPackage);
    } catch (error) {
        console.error("Create Package Error:", error); // לוג לשרת
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ message: messages });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getMealPackageById = async (req, res) => {
    try {
        const mealPackage = await MealPackage.findById(req.params.id).populate('fixedItems.product').populate('choiceRules.options');
        if (mealPackage) { res.json(mealPackage); } else { res.status(404).json({ message: 'Package not found' }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const updateMealPackage = async (req, res) => {
    try {
        const { name, description, ...rest } = req.body;
        
        // הכנת אובייקט עדכון בטוח
        const updateData = { ...rest };
        
        // עדכון שדות טקסט רק אם סופקו
        if (name) {
            updateData.name = {
                he: name.he || '',
                en: name.en || ''
            };
        }
        
        if (description) {
            updateData.description = {
                he: description.he || '',
                en: description.en || ''
            };
        }

        const updatedPackage = await MealPackage.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (updatedPackage) { res.json(updatedPackage); } 
        else { res.status(404).json({ message: 'Package not found' }); }
    } catch (error) { 
        console.error("Update Package Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ message: messages });
        }
        res.status(500).json({ message: 'Server Error' }); 
    }
};

export const deleteMealPackage = async (req, res) => {
    try {
        const mealPackage = await MealPackage.findById(req.params.id);
        if (mealPackage) {
            await MealPackage.deleteOne({ _id: mealPackage._id });
            res.json({ message: 'Package removed' });
        } else { res.status(404).json({ message: 'Package not found' }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const getOrderByIdForAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.item');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Reports ---
export const getPreparationReport = async (req, res) => {
    const { deliveryDate } = req.query;
    if (!deliveryDate) {
        return res.status(400).json({ message: 'A delivery date is required' });
    }

    try {
        const orders = await Order.find({ deliveryDate });
        const preparationSummary = {};

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.itemType === 'Product') {
                    const productName = item.name;
                    preparationSummary[productName] = (preparationSummary[productName] || 0) + item.quantity;
                }
                else if (item.itemType === 'MealPackage') {
                    const packageName = `${item.name} (חבילה)`;
                    preparationSummary[packageName] = (preparationSummary[packageName] || 0) + 1;

                    item.packageSelections.forEach(selection => {
                        selection.selectedOptions.forEach(option => {
                            const optionName = option.name;
                            preparationSummary[optionName] = (preparationSummary[optionName] || 0) + 1;
                        });
                    });
                }
            });
        });

        const sortedReport = Object.entries(preparationSummary).map(([name, quantity]) => ({
            name,
            quantity
        })).sort((a, b) => a.name.localeCompare(b.name, 'he'));
        res.json(sortedReport);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getDeliveryReport = async (req, res) => {
    const { deliveryDate } = req.query;
    if (!deliveryDate) {
        return res.status(400).json({ message: 'A delivery date is required' });
    }

    try {
        const orders = await Order.find({ deliveryDate }).populate('user', 'name');
        const finalReport = { pickups: [], deliveries: {} };
        orders.forEach(order => {
            if (order.fulfillmentType === 'Pickup') {
                finalReport.pickups.push({
                    orderId: order._id.toString().substring(18).toUpperCase(),
                    customerName: order.shippingDetails.customerName,
                    phone: order.shippingDetails.phone,
                    notes: order.notes || '',
                    totalPrice: order.totalPrice,
                    fulfillmentDetails: order.fulfillmentDetails
                });
            } else { 
                const city = order.shippingDetails.city;
                if (!finalReport.deliveries[city]) {
                    finalReport.deliveries[city] = [];
                }
                finalReport.deliveries[city].push({
                    orderId: order._id.toString().substring(18).toUpperCase(),
                    customerName: order.shippingDetails.customerName,
                    phone: order.shippingDetails.phone,
                    streetAddress: order.shippingDetails.streetAddress,
                    city: order.shippingDetails.city,
                    floor: order.shippingDetails.floor || '-',
                    apartment: order.shippingDetails.apartment || '-',
                    notes: order.notes || ''
                });
            }
        });

        finalReport.pickups.sort((a, b) => a.customerName.localeCompare(b.customerName, 'he'));
        res.json(finalReport);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getDeliveryCenterById = async (req, res) => {
  try {
    const center = await DeliveryCenter.findById(req.params.id);
    if (center) {
      res.json(center);
    } else {
      res.status(404).json({ message: 'Delivery center not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Category Management ---
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, key, image, displayOrder } = req.body;
    const newCategory = new Category({ name, key, image, displayOrder });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'קטגוריה עם מפתח זה כבר קיימת.' });
    }
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedCategory) {
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProductCategoryKeys = async (req, res) => {
  try {
    const categoryKeys = Product.schema.path('category').enumValues;
    res.json(categoryKeys);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Coupon Management ---
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'קוד קופון זה כבר קיים.' });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            res.json(coupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (updatedCoupon) {
            res.json(updatedCoupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await Coupon.deleteOne({ _id: coupon._id });
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getGeneralSettings = async (req, res) => {
    try {
        let settings = await GeneralSettings.findOne({ identifier: 'main' });
        if (!settings) {
            settings = await GeneralSettings.create({ identifier: 'main' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateGeneralSettings = async (req, res) => {
    try {
        const { freeShippingThreshold } = req.body;
        const settings = await GeneralSettings.findOneAndUpdate(
            { identifier: 'main' },
            { freeShippingThreshold },
            { new: true, upsert: true, runValidators: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Global Delivery Dates Management ---
export const getDeliveryDates = async (req, res) => {
  try {
    const dates = await DeliveryDate.find({}).sort({ date: 1 });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createDeliveryDate = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const newDate = new DeliveryDate({ date, isActive: true });
    const savedDate = await newDate.save();
    res.status(201).json(savedDate);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This date already exists.' });
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const deleteDeliveryDate = async (req, res) => {
  try {
    const date = await DeliveryDate.findById(req.params.id);
    if (date) {
      await DeliveryDate.deleteOne({ _id: date._id });
      res.json({ message: 'Date removed' });
    } else {
      res.status(404).json({ message: 'Date not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const ensureBaseDeliveryZones = async () => {
    const requiredZones = ['צפון', 'מרכז', 'דרום', 'אזורים נבחרים'];
    for (const zoneName of requiredZones) {
        const existing = await DeliveryCenter.findOne({ name: zoneName, type: 'DeliveryZone' });
        if (!existing) {
            await DeliveryCenter.create({
                name: zoneName,
                type: 'DeliveryZone',
                price: 0,
                isActive: true
            });
            console.log(`Created missing delivery zone: ${zoneName}`);
        }
    }
};

export const getDeliveryCenters = async (req, res) => {
  try {
    await ensureBaseDeliveryZones();
    const centers = await DeliveryCenter.find({}).sort({ type: 1, name: 1 });
    res.json(centers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const createDeliveryCenter = async (req, res) => {
  try {
    const { name, address, isActive, type, availableDates } = req.body;
    if (type !== 'Pickup') {
        return res.status(400).json({ message: 'Only pickup points can be created dynamically.' });
    }
    const newCenter = new DeliveryCenter({ name, address, isActive, type, availableDates });
    const savedCenter = await newCenter.save();
    res.status(201).json(savedCenter);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const updateDeliveryCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, cities, isActive, availableDates, name, address } = req.body;

        const center = await DeliveryCenter.findById(id);
        if(!center) {
            return res.status(404).json({ message: 'Center not found' });
        }

        if (center.type === 'DeliveryZone') {
            if (price !== undefined) center.price = price;
            if (cities !== undefined) center.cities = cities;
        } else { 
            if (name !== undefined) center.name = name;
            if (address !== undefined) center.address = address;
            if (availableDates !== undefined) center.availableDates = availableDates;
        }

        if (isActive !== undefined) center.isActive = isActive;
        const updatedCenter = await center.save();
        res.json(updatedCenter);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const deleteDeliveryCenter = async (req, res) => {
  try {
    const center = await DeliveryCenter.findById(req.params.id);
    if (center) {
        if (center.type === 'DeliveryZone') {
            return res.status(400).json({ message: 'Cannot delete fixed delivery zones.' });
        }
      await DeliveryCenter.deleteOne({ _id: center._id });
      res.json({ message: 'Pickup point removed' });
    } else {
      res.status(404).json({ message: 'Center not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};