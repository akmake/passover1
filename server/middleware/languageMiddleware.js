// server/middleware/languageMiddleware.js

const getLanguage = (req, res, next) => {
    // 1. נותנים עדיפות ראשונה לקוקי שהמשתמש בחר באתר
    const langCookie = req.cookies.i18next;
    if (langCookie && ['he', 'en'].includes(langCookie)) {
        req.language = langCookie;
        return next();
    }

    // 2. אם אין קוקי, נשתמש בזיהוי מהדפדפן
    const langHeader = req.headers['accept-language'];
    if (langHeader && langHeader.startsWith('en')) {
        req.language = 'en';
    } else {
        req.language = 'he'; // ברירת המחדל תמיד תהיה עברית
    }
    
    next();
};

export default getLanguage;