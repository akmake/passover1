import app from './app.js';
import connectDB from './config/db.js';
import 'dotenv/config';

// הגדרת הפורט - חובה להשתמש ב-process.env.PORT בשביל רנדר
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. התחברות למונגו (כמו שביקשת - מלא)
        await connectDB();
        console.log('🌱 Database Connected Successfully');

        // 2. הרצת השרת בפרוטוקול HTTP רגיל
        // הסבר: רנדר לוקח את ה-HTTP הזה והופך אותו ל-HTTPS אוטומטית כלפי חוץ.
        // אין צורך לייבא https או fs כאן.
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        // אם המסד נתונים לא מתחבר, עוצרים את השרת כדי לא להריץ אפליקציה שבורה
        process.exit(1);
    }
};

startServer();