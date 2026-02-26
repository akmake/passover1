import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Utils & Middleware
import logger from './utils/logger.js';
import getLanguage from './middleware/languageMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

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
import homePageRoutes from './routes/homePageRoutes.js';
import homeMediaRoutes from './routes/homeMediaRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// הגדרת Trust Proxy עבור עבודה מאחורי Render/Proxies
app.set('trust proxy', 1);

// אבטחה - מאפשר טעינת מדיה ממקורות שונים (חשוב לוידאו ותמונות)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// הגדרת CORS מסונכרנת
const allowedOrigins = [
  'https://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://passover1.onrender.com',
  'https://passover1-1.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(getLanguage);

// ==========================================
// טיפול בקבצים סטטיים (Uploads) 
// ==========================================

// 1. נתיב השרת המרכזי (server/uploads) - כאן נשמרים הקבצים החדשים
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, path) => {
        // מוודא שהדפדפן מבין שמדובר בתוכן שיכול להיות מוזרם (חשוב לוידאו)
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// 2. נתיב גיבוי ללקוח (client/public/uploads) - עבור קבצים ישנים אם קיימים
const clientUploadsPath = path.join(__dirname, '../client/public/uploads');
app.use('/uploads', express.static(clientUploadsPath));

// =====================
// רישום נתיבי ה-API
// =====================
app.use('/api/homepage', homePageRoutes);
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
app.use('/api/home-media', homeMediaRoutes); // נוסף לסנכרון מלא
app.use('/api/promotions', promotionRoutes); // נוסף לסנכרון מלא

// טיפול בשגיאות (מרוכז)
app.use(errorHandler);

export default app;