// server/middleware/errorHandler.js
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    // לוג השגיאה עם פרטים מלאים תמיד
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });

    // הגדרת סטטוס ושגיאה בסיסית
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    // הודעה למשתמש
    const response = {
        message: isProduction ? 'Something went wrong' : err.message
    };

    // הוסף פרטים נוספים רק אם לא בפרודקשן
    if (!isProduction) {
        response.stack = err.stack;
    }

    // טפל בסוגי שגיאות ספציפיים
    if (err.name === 'ValidationError') {
        response.message = 'Invalid input data';
        response.errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json(response);
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        response.message = 'Duplicate key error';
        return res.status(409).json(response);
    }

    if (err.name === 'JsonWebTokenError') {
        response.message = 'Invalid or expired token';
        return res.status(401).json(response);
    }

    res.status(statusCode).json(response);
};