import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js'; // כאן אנחנו מייבאים את האפליקציה שהגדרנו למעלה
import connectDB from './config/db.js'; // <--- 1. הוסף את הייבוא הזה!


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;



// פונקציה להפעלת השרת
const startServer = async () => {
    try {
        // --- 2. קודם כל מתחברים לדאטה-בייס ---
        await connectDB(); 
        console.log('🌱 Database Connected Successfully');

        // --- 3. רק אז מריצים את השרת ---
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'localhost+1-key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'localhost+1.pem'))
        };

        https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(`✅ Secure Server running on https://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        
        if (error.code === 'ENOENT') {
            console.error('Check SSL certificates location.');
        }
    }
};

startServer();