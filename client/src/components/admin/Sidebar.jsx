// client/src/components/Sidebar.jsx (עדכון לקיים)

import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // חדש: אנימציות
import { useDebounce } from 'use-debounce'; // חדש: לחיפוש
import { ShoppingCart, User, LogOut, History, Home, UtensilsCrossed, Settings, Moon, Sun, Search, ChevronDown, ChevronRight, BarChart, Users, Package, FileText, Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import api from '@/api';

// Theme persistence (פשוט, ללא Zustand נוסף)
const useTheme = () => {
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  return { isDark, toggle: () => setIsDark(prev => !prev) };
};

const Sidebar = () => {
  const { isAuthenticated, user, logout: logoutFromStore } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { isDark, toggle } = useTheme(); // חדש: dark mode
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768); // חדש: responsive
  const [searchQuery, setSearchQuery] = useState(''); // חדש: search
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [newOrders, setNewOrders] = useState(0); // חדש: badge example (API)

  // Logout logic (ללא שינוי)
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

  // Outside click (ללא שינוי)
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  // Fetch new orders for badge (חדש: דוגמה, התאם)
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchNewOrders = async () => {
        try {
          const { data } = await api.get('/api/admin/orders?status=חדשה'); // התאם ל-API
          setNewOrders(data.length);
        } catch (err) {
          console.error('Failed to fetch new orders');
        }
      };
      fetchNewOrders();
    }
  }, [user]);

  // Auto-collapse on resize (חדש)
  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Menu items with nesting (מבוסס על הקיים, הוסף sub-items לאדמין)
  const menuItems = [
    { icon: Home, label: 'בית', path: '/' },
    { icon: UtensilsCrossed, label: 'תפריט', path: '/menu' },
    ...(user?.role === 'admin' ? [
      { icon: Settings, label: 'פאנל ניהול', path: '/admin/dashboard', subItems: [
        { icon: LayoutDashboard, label: 'דשבורד', path: '/admin/dashboard' },
        { icon: Package, label: 'מוצרים', path: '/admin/products', subItems: [
          { label: 'רשימה', path: '/admin/products' },
          { label: 'חדש', path: '/admin/products/new' },
        ] },
        { icon: Users, label: 'משתמשים', path: '/admin/users' },
        { icon: BarChart, label: 'הזמנות', path: '/admin/orders', badge: newOrders },
        { icon: FileText, label: 'דוחות', path: '/admin/reports', subItems: [
          { label: 'הכנה', path: '/admin/reports/preparation' },
          { label: 'משלוחים', path: '/admin/reports/delivery' },
        ] },
        { icon: Truck, label: 'הגדרות', path: '/admin/settings', subItems: [
          { label: 'כללי', path: '/admin/settings' },
          { label: 'דף הבית', path: '/admin/homepage-settings' },
        ] },
      ] },
    ] : []),
  ].filter(item => 
    item.label.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
    (item.subItems && item.subItems.some(sub => sub.label.toLowerCase().includes(debouncedQuery.toLowerCase())))
  );

  const linkClass = `flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`;
  const activeLinkClass = `flex items-center gap-4 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 250 }}
      animate={{ width: isCollapsed ? 80 : 250 }}
      transition={{ duration: 0.3 }}
      className="h-screen w-64 fixed top-0 right-0 flex flex-col bg-white dark:bg-gray-800 border-l shadow-md overflow-y-auto" // RTL: right-0
      role="navigation"
      aria-label="Sidebar"
    >
      {/* Header (ללא שינוי) */}
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          קייטרינג פלוס
        </Link>
      </div>

      {/* Toggle Button (חדש) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={!isCollapsed}
      >
        <ChevronRight className={`h-5 w-5 transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Search Bar (חדש) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> {/* RTL: right-3 */}
              <input
                type="text"
                placeholder="חיפוש..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="חיפוש בתפריט"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav (משופר עם nesting) */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item, idx) => (
          item.subItems ? (
            <details key={idx} className="group">
              <summary className={`${linkClass} cursor-pointer justify-between`}>
                <div className="flex items-center">
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="mr-2">{item.label}</span>} {/* RTL: mr-2 */}
                </div>
                {!isCollapsed && <ChevronDown className="h-4 w-4 group-open:rotate-180" />}
                {item.badge > 0 && !isCollapsed && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>}
              </summary>
              <ul className={`pr-6 space-y-1 ${isCollapsed ? 'hidden' : ''}`}> {/* RTL: pr-6 */}
                {item.subItems.map((sub, subIdx) => (
                  <li key={subIdx}>
                    <NavLink to={sub.path} className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
                      {sub.icon && <sub.icon className="h-5 w-5 mr-2" />} {/* RTL: mr-2 */}
                      <span>{sub.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <NavLink key={idx} to={item.path} className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.label}</span>}
              {item.badge > 0 && !isCollapsed && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>}
            </NavLink>
          )
        ))}
      </nav>

      {/* Footer (משופר עם dark mode toggle) */}
      <div className="px-4 py-4 mt-auto border-t dark:border-gray-700">
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1" // RTL: origin-bottom-right, right-0
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                  <p className="font-semibold">שלום, {user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link to="/my-orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                  <History className="h-4 w-4" />
                  ההזמנות שלי
                </Link>
                <button onClick={handleLogout} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50" role="menuitem"> {/* RTL: text-right */}
                  <LogOut className="h-4 w-4" />
                  התנתקות
                </button>
              </motion.div>
            )}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-haspopup="menu" aria-expanded={isUserMenuOpen} id="user-menu-button">
                <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="עגלת קניות">
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
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
        {/* Dark Mode Toggle (חדש) */}
        <button onClick={toggle} className="w-full flex items-center gap-2 p-2 mt-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="החלפת מצב תצוגה">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!isCollapsed && <span>{isDark ? 'מצב בהיר' : 'מצב כהה'}</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;