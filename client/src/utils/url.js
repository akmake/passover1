// client/src/utils/url.js
export function toAbsoluteUrl(raw, base) {
  if (!raw) return null;

  // אם כבר מוחלט (http/https, data:, blob:) — החזר כמו שהוא
  if (/^(https?:)?\/\//i.test(raw) || /^data:/.test(raw) || /^blob:/.test(raw)) {
    return raw;
  }

  // נרמול backslashes -> forward slashes
  let path = String(raw).replace(/\\/g, '/').trim();

  // בסיס (שרת) – מה-ENV או פרמטר
  const origin = (base || import.meta.env.VITE_SERVER_ORIGIN || 'https://localhost:5000')
    .replace(/\/+$/,'');

  // אם הנתיב מתחיל בסלאש — הצמד ישירות
  if (path.startsWith('/')) return `${origin}${path}`;

  // מקרים כמו "uploads/..." או "images/..."
  if (/^(uploads|images)\b/i.test(path)) return `${origin}/${path}`;

  // אחרת: נתיב יחסי בצד הקליינט
  return path;
}
