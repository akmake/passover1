import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShoppingCart, Package, Box, LayoutGrid, 
  Ticket, FileText, Truck, Users, Home, Settings, 
  Menu, X, LogOut, ChevronDown, User 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/Dropdown-menu";
import api from '@/api';

// --- הגדרת תפריט המנהל (מבנה הנתונים) ---
const adminGroups = [
  {
    title: 'כללי',
    items: [
      { to: '/admin/dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
      { to: '/admin/orders', label: 'ניהול הזמנות', icon: ShoppingCart },
    ]
  },
  {
    title: 'קטלוג',
    items: [
      { to: '/admin/products', label: 'מוצרים', icon: Package },
      { to: '/admin/packages', label: 'חבילות חג', icon: Box },
      { to: '/admin/categories', label: 'קטגוריות', icon: LayoutGrid },
      { to: '/admin/coupons', label: 'קופונים', icon: Ticket },
    ]
  },
  {
    title: 'דוחות',
    items: [
      { to: '/admin/reports/preparation', label: 'דוח ייצור', icon: FileText },
      { to: '/admin/reports/delivery', label: 'דוח משלוחים', icon: Truck },
    ]
  },
  {
    title: 'מערכת',
    items: [
      { to: '/admin/users', label: 'משתמשים', icon: Users },
      { to: '/admin/homepage-settings', label: 'עיצוב דף הבית', icon: Home },
      { to: '/admin/settings', label: 'הגדרות', icon: Settings },
    ]
  }
];

// --- הקומפוננטה הראשית ---
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout: logoutFromStore } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch (e) {} 
    finally { logoutFromStore(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" dir="rtl">
      
      {/* 1. Sidebar for Desktop (קבוע בצד ימין - RTL) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:right-0 border-l border-gray-200 bg-white z-50">
        <SidebarContent 
          user={user} 
          logout={handleLogout} 
        />
      </div>

      {/* 2. Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b h-16 px-4 sticky top-0 z-40">
        <Link to="/admin/dashboard" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
             Admin Panel
        </Link>

        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
           <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* 3. Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 right-0 z-50 w-64 md:hidden shadow-2xl bg-white"
            >
                <SidebarContent
                    user={user}
                    logout={handleLogout}
                    onClose={() => setSidebarOpen(false)}
                />
            </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 5. Main Content Area */}
      {/* ה-padding (pr-64) דוחף את התוכן שמאלה כדי שלא יוסתר ע"י הסרגל הקבוע */}
      <div className="flex-1 md:pr-64">
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// --- תוכן הסרגל (זהה ל-Navbar.jsx שלך) ---
function SidebarContent({ user, logout, onClose }) {
  return (
      <div className="flex flex-col flex-grow overflow-y-auto h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-slate-50 border-b">
              <Link to="/admin/dashboard" onClick={onClose} className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Panel
              </Link>
              {onClose && (
                  <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                      <X className="h-5 w-5" />
                  </Button>
              )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col py-4 px-3 gap-6">
              {adminGroups.map((group, idx) => (
                  <div key={idx}>
                      <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {group.title}
                      </h3>
                      <nav className="space-y-1">
                          {group.items.map((item) => (
                              <NavItem key={item.to} item={item} onClick={onClose} />
                          ))}
                      </nav>
                  </div>
              ))}
          </div>

          {/* User Footer */}
          <div className="px-2 py-4 border-t bg-gray-50">
              <UserNav user={user} logout={logout} />
          </div>
      </div>
  );
}

// --- פריט ניווט (הועתק מ-Navbar.jsx) ---
function NavItem({ item, onClick }) {
  const navLinkClass = "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const activeClass = "bg-blue-50 text-blue-700";
  const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  
  return (
      <NavLink
          to={item.to}
          onClick={onClick}
          className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : inactiveClass}`}
      >
          <item.icon className="ml-3 flex-shrink-0 h-5 w-5" />
          {item.label}
      </NavLink>
  );
}

// --- תפריט משתמש (הועתק מ-Navbar.jsx) ---
function UserNav({ user, logout }) {
  const getInitials = (name) => {
      if (!name) return 'A';
      const names = name.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name[0].toUpperCase();
  };

  return (
      <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none">
              <div className="flex items-center gap-3 text-sm font-medium p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {getInitials(user?.name)}
                  </div>
                  <div className="text-start flex-1 truncate">
                      <p className="font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>התנתק</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );
}