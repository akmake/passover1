// client/src/utils/url.js

export function getServerOrigin() {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) return apiBase.replace(/\/api\/?$/, '');
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'https://localhost:5000';
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

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

  // 3. חישוב שורש השרת
  const serverRoot = getServerOrigin();

  // 4. כעת הכתובת תמיד תכלול את השרת, גם עבור uploads
  return `${serverRoot}${path}`;
}