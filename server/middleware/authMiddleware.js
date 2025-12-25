import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;

  // 1. בדיקת קוקיז
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  // 2. בדיקת Header (Bearer Token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // שליפת המשתמש (תומך גם ב-password וגם ב-passwordHash למניעת שגיאות)
    req.user = await User.findById(decoded.id).select('-password -passwordHash'); 
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  // בדיקה גמישה: גם isAdmin (בוליאני) וגם role (מחרוזת)
  if (req.user && (req.user.isAdmin === true || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// --- כאן התיקון החשוב ---
// אנחנו מייצאים גם את השמות החדשים וגם את הישנים (בתור כינויים)
export { 
  protect, 
  admin, 
  protect as requireAuth, 
  admin as requireAdmin 
};