import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // השורה הזו מושכת את הכתובת שהגדרת ב-Render
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // במקרה של שגיאה, השרת יעצור כדי ש-Render ינסה להפעיל מחדש
    process.exit(1);
  }
};

export default connectDB;