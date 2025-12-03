import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, User, LogOut, History, Home, UtensilsCrossed, Settings } from 'lucide-react';
import api from '@/api';

const Sidebar = () => {
  const { isAuthenticated, user, logout: logoutFromStore } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Failed to logout from server:', error);
    } finally {
      logoutFromStore();
      setIsUserMenuOpen(false);
    }
  };
  
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);


  const linkClass = "flex items-center gap-4 px-4 py-3 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors";
  const activeLinkClass = "flex items-center gap-4 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg";

  return (
    <aside className="h-screen w-64 fixed top-0 right-0 flex flex-col bg-white border-l shadow-md">
      <div className="px-6 py-4 border-b">
        <Link to="/" className="text-2xl font-bold text-gray-900">
          קייטרינג פלוס
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink to="/" className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
            <Home className="h-5 w-5" />
            <span>בית</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
            <UtensilsCrossed className="h-5 w-5" />
            <span>תפריט</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
            <Settings className="h-5 w-5" />
            <span>פאנל ניהול</span>
          </NavLink>
        )}
      </nav>

      <div className="px-4 py-4 mt-auto border-t">
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                 <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">שלום, {user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/my-orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <History className="h-4 w-4" />
                    ההזמנות שלי
                  </Link>
                  <button onClick={handleLogout} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    התנתקות
                  </button>
              </div>
            )}
            <div className="flex items-center gap-4">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <User className="h-6 w-6 text-gray-600" />
                </button>
                <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-gray-600" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{totalItems}</span>
                    )}
                </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button asChild className="w-full"><Link to="/register">הרשמה</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link to="/login">התחברות</Link></Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;