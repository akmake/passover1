// client/src/utils/url.js

export function toAbsoluteUrl(raw) {
  if (!raw) return null;

  // 1. אם זה כבר קישור מלא (למשל מ-Cloudinary או קישור חיצוני), החזר כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || /^data:/.test(raw) || /^blob:/.test(raw)) {
    return raw;
  }

  // 2. נרמול הנתיב (החלפת סלאשים הפוכים לרגילים והסרת רווחים)
  let path = String(raw).replace(/\\/g, '/').trim();
  
  // וודא שיש סלאש בהתחלה
  if (!path.startsWith('/')) {
      path = '/' + path;
  }

  // 3. חישוב שורש השרת (הלוגיקה מפרויקט ציפורי)
  // לוקחים את כתובת ה-API המוגדרת (למשל https://passover1.onrender.com)
  // שימוש ב-VITE_API_BASE_URL או בכתובת ברירת המחדל שלך
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://passover1.onrender.com';
  
  // מסירים את הסיומת "/api" (אם קיימת) כדי לקבל את כתובת השורש של השרת
  // לדוגמה: הופך את https://site.com/api ל- https://site.com
  const serverRoot = apiBase.replace(/\/api\/?$/, ''); 

  // 4. החזרת הכתובת המלאה
  // התוצאה תהיה: https://passover1.onrender.com/uploads/filename.jpg
  return `${serverRoot}${path}`;
}