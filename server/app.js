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

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// רשימת דומיינים מורשים
const allowedOrigins = [
  'https://localhost:5173', // הלקוח המאובטח
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

// =====================
// סטטיק (מתוקן)
// =====================

// 1) זה המקום הנכון לקבצים שמועלים ע"י השרת (server/uploads)
const uploadsPath = path.join(__dirname, 'uploads'); // server/uploads
app.use('/uploads', express.static(uploadsPath));

// 2) (אופציונלי) אם עדיין יש לך קבצים ידניים ב-client/public/uploads ורוצה לשמור תאימות:
const clientUploadsPath = path.join(__dirname, '../client/public/uploads');
app.use('/uploads', express.static(clientUploadsPath));

// =====================
// נתיבים
// =====================
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

// החלק החשוב:
export default app;
