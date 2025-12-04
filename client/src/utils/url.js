// client/src/utils/url.js

export function toAbsoluteUrl(raw) {
  if (!raw) return null;

  // 1. אם זה כבר קישור מלא (למשל תמונה חיצונית או base64), החזר כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || /^data:/.test(raw) || /^blob:/.test(raw)) {
    return raw;
  }

  // 2. נרמול הנתיב
  let path = String(raw).replace(/\\/g, '/').trim();
  if (!path.startsWith('/')) {
      path = '/' + path;
  }

  // --- מחק או שים בהערה את החלק הזה ---
  // if (path.startsWith('/uploads')) {
  //     return path;
  // }
  // ------------------------------------

  // 3. חישוב שורש השרת
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://passover1.onrender.com';

  // מסירים את הסיומת "/api" (אם קיימת)
  const serverRoot = apiBase.replace(/\/api\/?$/, '');

  // 4. כעת הכתובת תמיד תכלול את השרת, גם עבור uploads
  return `${serverRoot}${path}`;
}