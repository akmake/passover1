// client/src/components/Navbar.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart, User, LogOut, History } from 'lucide-react';
import api from '@/api';
import { useScroll } from '@/hooks/useScroll';
import LanguageSwitcher from './LanguageSwitcher';

// עדכון צבעי הלינקים לרקע כהה
const navLinkBase = "relative inline-flex items-center px-1 py-2 text-slate-300 transition-colors duration-200 " + "hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 " + "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 " + "after:bg-amber-400 after:transition-all after:duration-300";
const navLinkActive = "text-white font-semibold after:w-full";

function getInitials(name) {
  if (!name) return 'א';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout: logoutFromStore } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const isScrolled = useScroll();
  const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Failed to logout from server:', error);
    } finally {
      logoutFromStore();
      closeUserMenu();
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, closeUserMenu]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!isUserMenuOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeUserMenu();
        if (userMenuButtonRef.current) 
          userMenuButtonRef.current.focus();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (firstMenuItemRef.current) firstMenuItemRef.current.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isUserMenuOpen, closeUserMenu]);

  return (
    // שינוי הרקע לשחור/כהה מאוד עם גבול עדין
    <header className={["sticky top-0 z-50 transition-all duration-300 border-b border-white/10", isScrolled ? "backdrop-blur-md bg-black/90 shadow-md" : "bg-black/80 backdrop-blur-sm"].join(' ')}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg group">
            {/* הוספת פילטר ללוגו כדי שיראה טוב על שחור במידה והוא לא שקוף */}
            <img src="/logo.png" alt="לוגו ציפורי - בית האוכל היהודי" className="h-14 sm:h-16 select-none transition-transform group-hover:scale-105" draggable={false} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-semibold text-white tracking-wide">צפורי</span>
              <span className="text-xs text-slate-400">בית האוכל היהודי</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-x-8 text-lg">
            <NavLink to="/" className={({ isActive }) => [navLinkBase, isActive ? navLinkActive : ""].join(' ')} end>
              {t('navbar.home')}
            </NavLink>
            <NavLink to="/menu" className={({ isActive }) => [navLinkBase, isActive ? navLinkActive : ""].join(' ')}>
              {t('navbar.menu')}
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" className={({ isActive }) => [navLinkBase, isActive ? navLinkActive : ""].join(' ')}>
                {t('navbar.adminPanel')}
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* התאמת צבע כפתור שפה */}
            <div className="text-slate-300 hover:text-white">
                <LanguageSwitcher />
            </div>
            
            <img src="/bdz.svg" alt="סמל כשרות בד&quot;ץ" className="h-10 sm:h-12 hidden sm:block select-none opacity-90 grayscale hover:grayscale-0 transition-all" draggable={false} />
            
            <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50" 
              aria-label={t('cart.openLabel')} title={t('cart.title')}>
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 items-center justify-center rounded-full bg-amber-600 px-1 text-xs text-white shadow-sm animate-[pop_180ms_ease-out] origin-center min-w-[1.25rem]" aria-live="polite">
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                {/* כפתור פרופיל מינימליסטי - ללא רקע צבעוני */}
                <button ref={userMenuButtonRef} onClick={() => setIsUserMenuOpen(v => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent border border-slate-600 text-slate-200 hover:text-white hover:border-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50" aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-label={t('userMenu.label')} title={t('userMenu.profile')}>
                  <span className="text-sm font-medium">
                    {getInitials(user?.name)}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div role="menu" aria-label={t('userMenu.label')} className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-slate-50">
                      <p className="font-semibold text-slate-900 truncate">{t('userMenu.greeting', { name: user?.name })}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    
                    <Link to="/my-orders" ref={firstMenuItemRef} onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none">
                      <History className="h-4 w-4 text-slate-500" />
                      {t('userMenu.myOrders')}
                    </Link>
                    <button onClick={handleLogout} role="menuitem" className="w-full text-right flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none">
                      <LogOut className="h-4 w-4" />
                      {t('userMenu.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <NavLink to="/login" className="text-slate-300 hover:text-white font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded px-2 py-1">
                  {t('navbar.login')}
                </NavLink>
                <Button asChild variant="outline" className="border-slate-600 text-slate-200 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent">
                  <Link to="/register" className="font-medium">{t('navbar.register')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <style>{` @keyframes pop { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(1); opacity: 1; } } `}</style>
    </header>
  );
};

export default Navbar;