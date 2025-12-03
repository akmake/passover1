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

const navLinkBase = "relative inline-flex items-center px-1 py-2 text-slate-700/90 transition-colors duration-200 " + "hover:text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 " + "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 " + "after:bg-amber-700 after:transition-all after:duration-300";
const navLinkActive = "text-amber-900 font-semibold after:w-full";

function getInitials(name) {
  if (!name) return 'א';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar = () => {
  const { t } = useTranslation(); // שימוש ב-hook של התרגום
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
        if (userMenuButtonRef.current) userMenuButtonRef.current.focus();
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
    <header className={["sticky top-0 z-50 transition-all duration-300 border-b", isScrolled ? "backdrop-blur-md bg-white/85 shadow-md" : "bg-white/70 backdrop-blur-sm"].join(' ')}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg">
            <img src="/logo.png" alt="לוגו ציפורי - בית האוכל היהודי" className="h-16 sm:h-20 select-none" draggable={false} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-semibold text-slate-900">ציפורי</span>
              <span className="text-xs text-slate-500">בית האוכל היהודי</span>
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

          <div className="flex items-center gap-1 sm:gap-3">
            <LanguageSwitcher />
            <img src="/bdz.svg" alt="סמל כשרות בד&quot;ץ" className="h-12 sm:h-16 hidden sm:block select-none" draggable={false} />
            <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50" aria-label={t('cart.openLabel')} title={t('cart.title')}>
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white shadow-sm animate-[pop_180ms_ease-out] origin-center min-w-[1.25rem]" aria-live="polite">
                  {totalItems}
                </span>
              )}
            </button>
    
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button ref={userMenuButtonRef} onClick={() => setIsUserMenuOpen(v => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50" aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-label={t('userMenu.label')} title={t('userMenu.profile')}>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-sm font-semibold">
                    {getInitials(user?.name)}
                  </span>
                </button>
        
                {isUserMenuOpen && (
                  <div role="menu" aria-label={t('userMenu.label')} className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gradient-to-b from-white to-amber-50/30">
                      <p className="font-semibold text-slate-900 truncate">{t('userMenu.greeting', { name: user?.name })}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
            
                    <Link to="/my-orders" ref={firstMenuItemRef} onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none">
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
                <NavLink to="/login" className="text-slate-700 hover:text-amber-800 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded">
                  {t('navbar.login')}
                </NavLink>
                <Button asChild>
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