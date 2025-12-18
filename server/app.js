import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import logger from './utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import deliveryOptionsRoutes from './routes/deliveryOptionsRoutes.js';
import homepageSettingsRoutes from './routes/homepageSettingsRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import getLanguage from './middleware/languageMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    })
);

// --- התיקון הגדול: הגדרת CORS שמתאימה גם למחשב שלך ---
const allowedOrigins = [
    'http://localhost:5173', // הפיתוח המקומי שלך
    'http://localhost:3000',
    'https://passover1-1.onrender.com', // השרת ב-Render
    process.env.CLIENT_URL // מה-ENV אם יש
];

app.use(cors({
    origin: (origin, callback) => {
        // מאפשר בקשות ללא origin (כמו Postman) או אם ה-origin ברשימה המותרת
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // לוג שיעזור לך לראות אם משהו נחסם
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(getLanguage);

// הפניית קבצים סטטיים
const uploadsPath = path.join(__dirname, '../client/public/uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/delivery-options', deliveryOptionsRoutes);
app.use('/api/homepage-settings', homepageSettingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({ message: err.message || 'שגיאת שרת' });
});

export default app;