import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // טוען משתני סביבה לפי המוד (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  // === הלוגיקה החכמה ===
  // 1. אם יש משתנה VITE_API_BASE_URL בקובץ .env - תשתמש בו.
  // 2. אחרת (ברירת מחדל) - תתחבר לשרת המקומי בפורט 5000.
  const target = env.VITE_API_BASE_URL || 'http://localhost:5000';

  console.log(`🚀 Vite Proxy target: ${target}`); // לוג שיראה לך בטרמינל לאן הוא מתחבר

  return {
    plugins: [
      react(),
      tailwind(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
      port: 5173,
      // הגדרת Proxy - פותרת את כל בעיות ה-CORS וה-404
      proxy: {
        // כל בקשה שמתחילה ב-/api תועבר לשרת
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false, // מאפשר עבודה עם https מקומי (self-signed) אם צריך
        },
        // התיקון הקריטי לתמונות! כל בקשה ל-/uploads תועבר לשרת
        '/uploads': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});