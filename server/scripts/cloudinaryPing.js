import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

(async () => {
  try {
    const res = await cloudinary.api.ping();
    console.log('Cloudinary ping OK:', res);
  } catch (err) {
    console.error('Cloudinary ping FAILED:', err?.message || err);
    console.error('Details:', err);
    process.exit(1);
  }
})();
