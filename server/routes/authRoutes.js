// routes/authRoutes.js
import express from 'express';
import { doubleCsrf } from 'csrf-csrf';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, refreshToken, enableMfa } from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../utils/validationSchemas.js';
import { sensitiveApiLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

// --- הגדרה מותנית של CSRF באמצעות csrf-csrf (החלפת csurf שהוסר) ---
let csrfProtection;
let generateCsrfToken;

if (process.env.NODE_ENV === 'test') {
  csrfProtection = (req, res, next) => next();
  generateCsrfToken = (req, res) => 'test-csrf-token';
} else {
  const { doubleCsrfProtection, generateToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
    cookieName: '__csrf',
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    },
    getTokenFromRequest: (req) => req.headers['x-csrf-token'],
  });
  csrfProtection = doubleCsrfProtection;
  generateCsrfToken = generateToken;
}
// ---------------------------------

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד 15 דקות.' }
});

// Route ציבורי לשליפת CSRF token (עודכן ל-csrf-csrf)
router.get('/csrf-token', (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
});

router.post('/register', csrfProtection, validate(registerSchema), registerUser);
router.post('/login', loginLimiter, csrfProtection, loginUser);
router.post('/logout', csrfProtection, logoutUser);
router.post('/forgot-password', csrfProtection, sensitiveApiLimiter, forgotPassword);
router.put('/reset-password/:token', csrfProtection, sensitiveApiLimiter, resetPassword);
router.post('/refresh', refreshToken);
router.post('/enable-mfa', requireAuth, requireAdmin, csrfProtection, enableMfa);

export default router;