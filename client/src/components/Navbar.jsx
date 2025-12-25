import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore'; 
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, User, Menu as MenuIcon, X, LogOut, ClipboardList, ShieldCheck } from 'lucide-react'; // שימוש באייקונים סטנדרטיים ויציבים

const Navbar = () => {
  const { user, logout, isAdmin } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  
  // חיבור ל-Store של העגלה
  const cartItems = useCartStore((state) => state.items) || [];
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // State לתפריטים
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // סגירת תפריטים במעבר עמוד
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // סגירת תפריט משתמש בלחיצה בחוץ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- המיפוי האמיתי מתוך App.jsx ---
  const navLinks = [
    { name: t('nav.collection', 'הקולקציה'), path: '/menu' }, // דף החנות הראשי
    { name: t('nav.packages', 'מארזים'), path: '/menu?category=packages' }, // סינון מארזים
    { name: t('nav.bespoke', 'הרכבה אישית'), path: '/package-builder' }, // דף ה-Builder הקיים
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-[#D4AF37]/20 shadow-sm transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-20 md:h-24 flex justify-between items-center relative">
          
          {/* 1. לינקים לדסקטופ (מחוברים לנתיבים קיימים בלבד) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="text-sm font-serif font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* 2. לוגו מרכזי */}
          <Link 
            to="/" 
            className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center z-20"
          >
            <span className="text-2xl md:text-3xl font-serif font-bold tracking-[0.15em] text-[#1A1A1A] whitespace-nowrap">
              ALI ZAHAV
            </span>
            <span className="text-[10px] text-[#D4AF37] tracking-[0.3em] uppercase mt-0.5">
              Luxury Events
            </span>
          </Link>

          {/* 3. צד שמאל: ניהול, משתמש, עגלה */}
          <div className="flex items-center gap-3 md:gap-6 z-20">
            
            {/* כפתור אדמין - מופיע רק למנהלים ומוביל ל-Dashboard */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest border border-[#1A1A1A] px-3 py-1.5 hover:bg-[#1A1A1A] hover:text-[#D4AF37] transition-all"
                title="לוח בקרה למנהלים"
              >
                <ShieldCheck size={14} />
                <span>ניהול</span>
              </Link>
            )}

            {/* תפריט משתמש (Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                // אם מחובר - כפתור שפותח תפריט
                <div>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors p-1"
                  >
                    <User size={20} strokeWidth={1.5} />
                    <span className="hidden md:block text-xs font-medium">{user.firstName}</span>
                  </button>

                  {/* התפריט הנפתח של המשתמש */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-3 w-48 bg-white border border-gray-100 shadow-xl rounded-sm py-2 overflow-hidden"
                      >
                         <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-500">מחובר כ:</p>
                            <p className="font-bold text-sm text-[#1A1A1A] truncate">{user.email}</p>
                         </div>
                         
                         {/* הקישור האמיתי להיסטוריית ההזמנות */}
                         <Link 
                           to="/order-history" 
                           className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors"
                         >
                           <ClipboardList size={16} />
                           ההזמנות שלי
                         </Link>

                         {isAdmin && (
                           <Link 
                             to="/admin" 
                             className="md:hidden flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors"
                           >
                             <ShieldCheck size={16} />
                             ניהול מערכת
                           </Link>
                         )}

                         <button 
                           onClick={logout} 
                           className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                         >
                           <LogOut size={16} />
                           התנתקות
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // אם לא מחובר - לינק להתחברות
                <Link to="/login" className="hover:text-[#D4AF37] transition-colors p-1" title="התחברות">
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}
            </div>

            {/* כפתור עגלה */}
            <button 
              onClick={toggleCart} 
              className="relative hover:text-[#D4AF37] transition-colors p-1"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A1A1A] text-[#D4AF37] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* כפתור המבורגר למובייל */}
            <button 
              className="md:hidden hover:text-[#D4AF37] p-1 ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- תפריט צד למובייל (Mobile Drawer) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <span className="font-serif font-bold text-lg tracking-widest">ALI ZAHAV</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-400 hover:text-black" />
                </button>
              </div>

              <div className="flex flex-col p-6 gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="text-lg font-serif text-[#1A1A1A] hover:text-[#D4AF37] flex justify-between items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <hr className="border-gray-100" />
                
                {user ? (
                   <div className="space-y-4">
                      <Link to="/order-history" className="flex items-center gap-3 text-gray-700 hover:text-[#D4AF37]">
                        <ClipboardList size={18} /> ההזמנות שלי
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 text-gray-700 hover:text-[#D4AF37]">
                          <ShieldCheck size={18} /> ניהול
                        </Link>
                      )}
                      <button onClick={logout} className="flex items-center gap-3 text-red-500 w-full text-right mt-4">
                        <LogOut size={18} /> יציאה
                      </button>
                   </div>
                ) : (
                  <Link to="/login" className="text-lg font-medium text-black">התחברות</Link>
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