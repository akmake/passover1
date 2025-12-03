// routes/authRoutes.js
import express from 'express';
import csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, refreshToken, enableMfa } from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../utils/validationSchemas.js';
import { sensitiveApiLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

// --- הגדרה מותנית של CSRF ---
let csrfProtection;

if (process.env.NODE_ENV === 'test') {
  // בסביבת בדיקות, נשתמש ב-middleware "דמה" שלא עושה כלום
  csrfProtection = (req, res, next) => next();
} else {
  // בכל סביבה אחרת, נפעיל את ההגנה האמיתית
  csrfProtection = csurf({ cookie: { httpOnly: true, secure: true, sameSite: 'strict' } });
}
// ---------------------------------

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד 15 דקות.' }
});

// Route ציבורי לשליפת CSRF token (יעבוד רק מחוץ לסביבת בדיקות)
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// שימוש ב-csrfProtection שהוגדר באופן מותנה
router.post('/register', csrfProtection, validate(registerSchema), registerUser);
router.post('/login', loginLimiter, csrfProtection, loginUser);
router.post('/logout', csrfProtection, logoutUser);
router.post('/forgot-password', csrfProtection, sensitiveApiLimiter, forgotPassword);
router.put('/reset-password/:token', csrfProtection, sensitiveApiLimiter, resetPassword);
router.post('/refresh', refreshToken);
router.post('/enable-mfa', requireAuth, requireAdmin, csrfProtection, enableMfa);

export default router;