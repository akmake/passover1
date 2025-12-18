import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

// אייקונים דקים ואלגנטיים יותר
const Icons = {
  Bag: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
};

const Navbar = ({ toggleCart }) => {
  const { user, logout, isAdmin } = useAuthStore();
  const cartState = useCartStore(); 
  const cart = cartState?.cart || []; 

  const { t } = useTranslation();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // חישוב כמות (בטוח לשימוש)
  const cartItemCount = Array.isArray(cart) 
    ? cart.reduce((acc, item) => acc + (item.quantity || 1), 0) 
    : 0;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // --- שינוי טקסטים לשפה "גבוהה" ומכבדת יותר ---
  const navLinks = [
    { name: 'הקולקציה שלנו', path: '/menu' },
    { name: 'עולם האירועים', path: '/menu?category=flowers' },
    { name: 'עיצוב אישי (Bespoke)', path: '/package-builder' },
    { name: 'מארזי יוקרה', path: '/menu?category=packages' },
  ];

  return (
    <>
      {/* השינוי הגדול: bg-white תמיד.
         הוספתי shadow-sm ובורדר עדין בזהב למטה כדי להפריד מהרקע הלבן של הדף
      */}
      <nav 
        className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#D4AF37]/20 shadow-sm transition-all duration-300"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 h-24 flex justify-between items-center">
          
          {/* 1. תפריט ימין (דסקטופ) */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="text-sm font-serif tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-all relative group"
              >
                {link.name}
                {/* קו תחתון עדין במעבר עכבר */}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-500 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* 2. לוגו (מרכז) - גדלנו אותו והדגשנו */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-serif font-bold tracking-[0.2em] text-[#1A1A1A]">
              ALI ZAHAV
            </span>
            <span className="text-[10px] text-[#D4AF37] tracking-[0.4em] uppercase mt-1">
              Luxury Events
            </span>
          </Link>

          {/* 3. אייקונים (שמאל) */}
          <div className="flex items-center gap-8">
            
            {/* כפתור אדמין אלגנטי */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="hidden md:block text-[10px] uppercase tracking-widest border border-[#1A1A1A] px-4 py-2 hover:bg-[#1A1A1A] hover:text-[#D4AF37] transition-all"
              >
                ניהול מערכת
              </Link>
            )}

            {/* אזור אישי / התחברות */}
            {user ? (
              <div className="hidden md:flex items-center gap-4 text-xs font-serif tracking-wider text-gray-600">
                <span>שלום, {user.firstName}</span>
                <button onClick={logout} className="hover:text-[#D4AF37] transition-colors border-b border-gray-300 pb-0.5">יציאה</button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block hover:text-[#D4AF37] transition-colors" title="התחברות">
                <Icons.User />
              </Link>
            )}

            {/* עגלה */}
            <button 
              onClick={toggleCart} 
              className="relative hover:text-[#D4AF37] transition-colors group"
            >
              <Icons.Bag />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#1A1A1A] text-[#D4AF37] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* תפריט מובייל */}
            <button 
              className="md:hidden hover:text-[#D4AF37]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Icons.Menu />
            </button>
          </div>
        </div>
      </nav>

      {/* --- תפריט צד למובייל (יוקרתי) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* כותרת מובייל */}
              <div className="flex justify-between items-center p-8 border-b border-gray-100">
                <div>
                    <span className="block text-xl font-serif font-bold tracking-widest text-[#1A1A1A]">ALI ZAHAV</span>
                    <span className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase">Art of Gifting</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-black">
                  <Icons.X />
                </button>
              </div>

              {/* קישורים */}
              <div className="flex flex-col p-8 gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="text-xl font-serif text-[#1A1A1A] hover:text-[#D4AF37] transition-colors flex justify-between items-center group"
                  >
                    {link.name}
                    <span className="text-gray-300 group-hover:text-[#D4AF37] text-sm">→</span>
                  </Link>
                ))}

                <div className="w-full h-[1px] bg-gray-100 my-4"></div>

                {user ? (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-sm">מחובר כ: <span className="font-bold text-black">{user.firstName}</span></p>
                    {isAdmin && <Link to="/admin" className="block text-[#D4AF37] font-bold text-sm uppercase tracking-widest">כניסה לניהול</Link>}
                    <button onClick={logout} className="text-red-500 text-sm border-b border-red-200 pb-1">התנתק מהחשבון</button>
                  </div>
                ) : (
                  <Link to="/login" className="text-lg font-serif text-black border-b border-black pb-1 inline-block w-max">
                    התחברות למועדון לקוחות
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;