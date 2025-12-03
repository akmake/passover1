import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // כתובת השרת לשימוש ב-Proxy (פיתוח)
  const target = env.VITE_API_BASE_URL || 'https://passover1.onrender.com';

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
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});