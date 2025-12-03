// server/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Rate limiter להרשמה והזמנות (נשאר ללא שינוי)
export const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 100, // 100 בקשות ל-IP
    message: { message: 'יותר מדי בקשות, נסה שוב בעוד 15 דקות.' }
});

// Rate limiter ל-routes רגישים כמו עדכון סיסמה (נשאר ללא שינוי)
export const sensitiveApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 10, // 10 בקשות ל-IP
    message: { message: 'יותר מדי ניסיונות, נסה שוב בעוד 15 דקות.' }
});

// Rate limiter לאדמינים - עודכן ל-250
export const adminApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 250, // <--- עודכן ל-250 בקשות כפי שביקשת
    message: { message: 'יותר מדי בקשות ממשק אדמין, נסה שוב בעוד 15 דקות.' }
});