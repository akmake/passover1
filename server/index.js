import https from 'https';
import http from 'http'; // הוספתי http
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './config/db.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
// בדיקה האם אנחנו בייצור (Render) או בפיתוח (Local)
const isProduction = process.env.NODE_ENV === 'production';

const startServer = async () => {
    try {
        // 1. חיבור לדאטה-בייס
        await connectDB();
        console.log('🌱 Database Connected Successfully');

        // 2. לוגיקה מפוצלת לפי סביבה
        if (isProduction) {
            // === מצב ייצור (Render) ===
            // מריצים HTTP רגיל. רנדר דואג ל-HTTPS מבחוץ.
            // לא טוענים קבצי pem כדי לא לקבל שגיאה.
            app.listen(PORT, () => {
                console.log(`✅ Production Server (Render) running on port ${PORT}`);
            });
        } else {
            // === מצב פיתוח (Local) ===
            // מנסים לטעון תעודות SSL למחשב שלך
            try {
                const sslOptions = {
                    key: fs.readFileSync(path.join(__dirname, 'localhost+1-key.pem')),
                    cert: fs.readFileSync(path.join(__dirname, 'localhost+1.pem'))
                };

                https.createServer(sslOptions, app).listen(PORT, () => {
                    console.log(`✅ Secure Local Server running on https://localhost:${PORT}`);
                });
            } catch (sslError) {
                // אם מחקת את התעודות או שיש שגיאה, הוא יחזור ל-HTTP רגיל במחשב
                console.warn('⚠️ SSL files missing locally. Falling back to HTTP.');
                http.createServer(app).listen(PORT, () => {
                    console.log(`✅ Local Server running on http://localhost:${PORT}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();