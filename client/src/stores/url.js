// client/src/utils/url.js
export function toAbsoluteUrl(raw, base) {
  if (!raw) return null;

  // כבר מוחלט? החזר כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || /^data:/.test(raw) || /^blob:/.test(raw)) {
    return raw;
  }

  // נרמול backslashes -> forward slashes
  let path = String(raw).replace(/\\/g, '/').trim();

  const origin = (base || import.meta.env.VITE_SERVER_ORIGIN || 'https://localhost:5000')
    .replace(/\/+$/,'');

  // אם מתחיל בסלאש – לצרף ל-origin
  if (path.startsWith('/')) return `${origin}${path}`;

  // מקרים כמו "uploads/..." / "images/..."
  if (/^(uploads|images)\b/i.test(path)) return `${origin}/${path}`;

  // אחרת – החזר כמות שהוא (נתיב יחסי לקליינט)
  return path;
}
