import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import MealPackage from '../models/mealPackageModel.js';
import Coupon from '../models/couponModel.js';
import sendEmail from '../utils/sendEmail.js';

export const createOrder = async (req, res) => {
    try {
        // שלב 1: קבלת נתונים מהלקוח, אך סומכים רק על המידע הבסיסי
        const { orderItems, shippingPrice: clientShippingPrice, couponCode, shippingDetails, deliveryDate, notes, fulfillmentType, fulfillmentDetails } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        if (!shippingDetails || !deliveryDate) {
            return res.status(400).json({ message: 'Shipping details and delivery date are required' });
        }

        // --- שלב 2: חישוב מאובטח של המחירים בצד השרת ---

        let serverItemsPrice = 0;
        const itemIds = orderItems.map(i => i._id);

        // שליפת כל המוצרים והחבילות הרלוונטיים מה-DB בפעם אחת
        const productsFromDB = await Product.find({ _id: { $in: itemIds } });
        const packagesFromDB = await MealPackage.find({ _id: { $in: itemIds } });

        // בניית מילון לגישה מהירה לפרטי המוצרים
        const productMap = new Map(productsFromDB.map(p => [p._id.toString(), p]));
        const packageMap = new Map(packagesFromDB.map(p => [p._id.toString(), p]));

        // מעבר על הפריטים וחישוב מחיר הפריטים לפי ה-DB
        for (const item of orderItems) {
            if (item.type === 'package') {
                const packageDetails = packageMap.get(item._id);
                if (!packageDetails) throw new Error(`Package with id ${item._id} not found.`);
                serverItemsPrice += packageDetails.price;
            } else {
                const productDetails = productMap.get(item._id);
                if (!productDetails) throw new Error(`Product with id ${item._id} not found.`);
                serverItemsPrice += productDetails.price * item.quantity;
            }
        }

        // חישוב הנחת קופון מחדש בצד השרת
        let serverDiscountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (coupon && serverItemsPrice >= coupon.minPurchase) {
                 if (coupon.discountType === 'percentage') {
                    serverDiscountAmount = (serverItemsPrice * coupon.discountValue) / 100;
                } else {
                    serverDiscountAmount = coupon.discountValue;
                }
            }
        }

        // חישוב הסכום הסופי
        const serverTotalPrice = serverItemsPrice - serverDiscountAmount + clientShippingPrice;
        
        // --- סוף החישוב המאובטח ---


        // עדכון הקופון אם נעשה בו שימוש
        if (couponCode && serverDiscountAmount > 0) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
                coupon.usedCount += 1;
                coupon.usersWhoUsed.push(req.user._id);
                await coupon.save();

                await User.findByIdAndUpdate(req.user._id, {
                    $push: { redeemedCoupons: coupon.code }
                });
            }
        }

        const formattedOrderItems = orderItems.map(item => {
            if (item.type === 'package') {
                return {
                    name: item.name,
                    price: item.price,
                    itemType: 'MealPackage',
                    item: item._id,
                    packageSelections: item.userChoices.map(choice => ({
                        category: choice.category,
                        selectedOptions: choice.selectedOptions.map(opt => ({ _id: opt._id, name: opt.name }))
                    }))
                };
            }
            return {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                itemType: 'Product',
                item: item._id,
            };
        });

        const order = new Order({
            orderItems: formattedOrderItems,
            user: req.user._id,
            itemsPrice: serverItemsPrice,         // <-- שימוש בערך המאובטח
            shippingPrice: clientShippingPrice,
            discountAmount: serverDiscountAmount, // <-- שימוש בערך המאובטח
            couponCode,
            totalPrice: serverTotalPrice,         // <-- שימוש בערך המאובטח
            shippingDetails,
            deliveryDate,
            notes,
            fulfillmentType,
            fulfillmentDetails,
        });

        const createdOrder = await order.save();

        try {
            await User.findByIdAndUpdate(req.user._id, { shippingDetails });
        } catch (updateError) {
            console.error('Failed to update user shipping details:', updateError);
        }

        try {
            const itemsSummary = createdOrder.orderItems.map(item => {
                if (item.itemType === 'MealPackage') {
                    return `- ${item.name} (חבילה)`;
                }
                return `- ${item.quantity} x ${item.name}`;
            }).join('\n');

            // תיקון קטן בשדה הכתובת במייל
            const message = `שלום ${createdOrder.shippingDetails.customerName},\n\nהזמנתך מספר ${createdOrder._id.toString().substring(18).toUpperCase()} התקבלה בהצלחה!\n\nפרטי ההזמנה:\n\n${itemsSummary}\n\nסך הכל לתשלום: ₪${createdOrder.totalPrice.toFixed(2)}\n\nתאריך משלוח: ${new Date(createdOrder.deliveryDate).toLocaleDateString('he-IL')}\nכתובת למשלוח: ${createdOrder.shippingDetails.streetAddress}, ${createdOrder.shippingDetails.city}\n\nתודה שבחרת בקייטרינג פלוס! ניצור איתך קשר במידת הצורך.\n\nבברכה,\nצוות קייטרינג פלוס`;

            await sendEmail({
                email: createdOrder.shippingDetails.email || req.user.email,
                subject: `אישור הזמנה #${createdOrder._id.toString().substring(18).toUpperCase()} מקייטרינג פלוס`,
                message: message,
            });
        } catch (emailError) {
            console.error('שליחת מייל אישור הזמנה נכשלה, אך ההזמנה נוצרה בהצלחה:', emailError);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const getOrderByIdForUser = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this order' });
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};