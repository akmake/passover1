// client/src/components/Navbar.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

// אייקונים דקים ואלגנטיים
const Icons = {
  Bag: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l-1 14H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = user?.role === 'admin';

  const cartItemCount = useMemo(() => {
    return Array.isArray(items) ? items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  }, [items]);

  // סגירת תפריט מובייל במעבר נתיב
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // שקיפות רק אחרי גלילה
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // לינקים רלוונטיים בלבד (הסרתי את אלה שלא מובילים/לא מעניינים אותך)
  const navLinks = [
    { name: 'תפריט', path: '/menu' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav
        className={[
          'fixed top-0 left-0 w-full z-50 transition-all duration-300',
          'border-b border-[#D4AF37]/20',
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
        ].join(' ')}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 h-24 flex justify-between items-center">
          {/* ימין: לינקים דסקטופ */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-serif tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* מרכז: לוגו */}
          <Link to="/" className="flex flex-col items-center select-none">
            <span className="text-xl md:text-2xl font-serif tracking-[0.25em] text-[#1A1A1A] leading-none">
              ALI ZAHAV
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#D4AF37] mt-1 uppercase font-light">
              Luxury Events
            </span>
          </Link>

          {/* שמאל: פעולות */}
          <div className="flex items-center gap-3">
            {/* כפתור תרגום (קיים אצלך) */}
            <LanguageSwitcher />

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden md:inline-block text-xs font-semibold tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
              >
                ADMIN
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors text-[#1A1A1A]"
              aria-label="Cart"
            >
              <Icons.Bag />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[#D4AF37] text-black text-[11px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all text-sm"
              >
                <Icons.User />
                <span className="tracking-widest text-xs">התנתקות</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all text-sm"
              >
                <Icons.User />
                <span className="tracking-widest text-xs">התחברות</span>
              </Link>
            )}

            {/* מובייל: כפתור תפריט */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors text-[#1A1A1A]"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* מובייל: תפריט נפתח */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-0 right-0 z-50 md:hidden bg-white border-b border-[#D4AF37]/20 shadow-sm"
          >
            <div className="px-6 py-4 flex flex-col gap-3 text-right">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="py-2 text-sm tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="py-2 text-sm tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                >
                  ADMIN
                </Link>
              )}

              <div className="pt-2 border-t border-black/5">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-right py-2 text-sm tracking-widest text-red-600 hover:text-red-700"
                  >
                    התנתקות
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 text-sm tracking-widest text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                  >
                    התחברות
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
