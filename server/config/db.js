import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // משיכת כתובת ההתחברות ממשתני הסביבה
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // יציאה עם שגיאה כדי ש-Render ינסה להפעיל מחדש את השרת
    process.exit(1);
  }
};

export default connectDB;