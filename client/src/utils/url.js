// client/src/utils/url.js

export function toAbsoluteUrl(raw) {
  if (!raw) return null;

  // 1. אם זה כבר קישור מלא (למשל תמונה חיצונית או base64), החזר כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || /^data:/.test(raw) || /^blob:/.test(raw)) {
    return raw;
  }

  // 2. נרמול הנתיב (החלפת סלאשים הפוכים לרגילים והסרת רווחים)
  let path = String(raw).replace(/\\/g, '/').trim();

  // וודא שיש סלאש בהתחלה
  if (!path.startsWith('/')) {
      path = '/' + path;
  }

  // --- התיקון החדש ---
  // אם הנתיב מתחיל ב-/uploads, זה אומר שהקובץ נמצא בתיקיית public/uploads של הקליינט.
  // במקרה כזה, אנחנו מחזירים את הנתיב כמו שהוא, ללא תוספת כתובת ה-API.
  // הדפדפן ידע למשוך את זה מהדומיין הנוכחי (הקליינט).
  if (path.startsWith('/uploads')) {
      return path;
  }

  // 3. חישוב שורש השרת (רק למקרים שאינם uploads, אם יהיו בעתיד)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://passover1.onrender.com';
  
  // מסירים את הסיומת "/api" (אם קיימת)
  const serverRoot = apiBase.replace(/\/api\/?$/, '');

  // 4. החזרת הכתובת המלאה (ברירת מחדל ישנה למקרה הצורך)
  return `${serverRoot}${path}`;
}