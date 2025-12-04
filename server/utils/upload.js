import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// הגדרת נתיבים (חובה ב-ES Modules כדי להשתמש ב-dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- שינוי הנתיב: שמירה בתיקיית ה-Public של הקליינט ---
// הולכים אחורה מ-utils (..) ומ-server (..) ואז נכנסים ל-client/public/uploads
const uploadDir = path.join(__dirname, '../../client/public/uploads');

// יצירת התיקייה אם היא לא קיימת (כולל תיקיות אב אם חסרות)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// הגדרת האחסון בדיסק
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // שמירה לנתיב החדש ב-client
  },
  filename: function (req, file, cb) {
    // יצירת שם ייחודי ונקי
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // ניקוי שם הקובץ מתווים בעייתיים או עברית שעלולה לשבור קישורים
    const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, uniqueSuffix + '-' + cleanName);
  },
});

// בדיקת סוג קובץ
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('רק קבצי תמונה מותרים! (jpeg, jpg, png, gif, webp)'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // הגבלה ל-5MB
});

export default upload;