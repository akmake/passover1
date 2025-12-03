// server/utils/localize.js

/**
 * פונקציה שמקבלת מסמך Mongoose ושפה, ומחזירה אובייקט "שטוח"
 * עם השדות המתורגמים בשפה המבוקשת.
 */
export function localizeFields(doc, lang) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc; // עובד גם על אובייקטים רגילים
    const localizedObj = { ...obj };

    for (const key in obj) {
        // בודק אם השדה הוא אובייקט שפות שלנו
        if (obj[key] && typeof obj[key] === 'object' && obj[key].hasOwnProperty('he') && obj[key].hasOwnProperty('en')) {
            // מחליף את האובייקט בטקסט המתורגם
            localizedObj[key] = obj[key][lang] || obj[key]['he']; // אם אין תרגום, ברירת המחדל היא עברית
        }
    }
    return localizedObj;
}