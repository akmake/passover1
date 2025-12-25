import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Package, Box, LayoutGrid,
  Ticket, FileText, Truck, Users, Home, Settings,
  Menu, X, LogOut, ChevronDown, User, Bell
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/Dropdown-menu";
import api from '@/api';

const adminGroups = [
  {
    title: 'ניהול שוטף',
    items: [
      { to: '/admin/dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
      { to: '/admin/orders', label: 'ניהול הזמנות', icon: ShoppingCart },
    ]
  },
  {
    title: 'חנות וקטלוג',
    items: [
      { to: '/admin/products', label: 'מוצרים', icon: Package },
      { to: '/admin/packages', label: 'חבילות חג', icon: Box },
      { to: '/admin/categories', label: 'קטגוריות', icon: LayoutGrid },
      { to: '/admin/coupons', label: 'קופונים', icon: Ticket },
    ]
  },
  {
    title: 'דאטה ומערכת',
    items: [
      { to: '/admin/reports/preparation', label: 'דוח ייצור', icon: FileText },
      { to: '/admin/users', label: 'משתמשים', icon: Users },
      { to: '/admin/settings', label: 'הגדרות', icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout: logoutFromStore } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch (e) {}
    finally { logoutFromStore(); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans text-slate-900" dir="rtl">

      {/* 1. Sidebar for Desktop (מתחיל מתחת ל-Navbar הראשי) */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:right-0 md:top-24 md:bottom-0 bg-white border-l border-slate-100 shadow-sm z-40">
        <SidebarContent user={user} logout={handleLogout} />
      </aside>

      {/* 2. Main Content Wrapper (כולו מתחיל מתחת ל-Navbar הראשי) */}
      <div className="flex-1 md:pr-72 flex flex-col min-h-screen pt-24">

        {/* Top Header - דביק מתחת ל-Navbar הראשי */}
        <header className="sticky top-24 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </div>

          {/* לוגו מרכזי בנאבר - תואם למותג */}
          <div className="flex flex-col items-center flex-1 md:flex-initial">
            <h1 className="text-2xl font-serif tracking-[0.2em] text-slate-900 leading-none">ALI ZAHAV</h1>
            <span className="text-[10px] tracking-[0.4em] text-amber-600 mt-1 uppercase font-light">Luxury Events</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-600 transition-colors">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* 3. Page Content */}
        <main className="p-6 lg:p-10 flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer (מתחיל מתחת ל-Navbar הראשי) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-x-0 bottom-0 top-24 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 bottom-0 top-24 z-[70] w-72 md:hidden shadow-2xl bg-white"
            >
              <SidebarContent user={user} logout={handleLogout} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ user, logout, onClose }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">Admin Console</span>
          <span className="text-lg font-serif tracking-widest text-slate-900">DASHBOARD</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {adminGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer - User Profile */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <UserNav user={user} logout={logout} />
      </div>
    </div>
  );
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
        ${isActive
          ? "bg-slate-900 text-white shadow-lg shadow-slate-200 ring-1 ring-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
      `}
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`ml-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
          <span className="tracking-wide">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}


function UserNav({ user, logout }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-xs font-bold text-amber-400 ring-2 ring-white shadow-sm">
            {initials}
          </div>
          <div className="text-right flex-1 truncate">
            <p className="text-sm font-bold text-slate-800 tracking-wide">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tight">{user?.role || 'Administrator'}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-xl border-slate-100" align="start" side="top" sideOffset={10}>
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">מחובר כ-</p>
          <p className="text-sm font-bold text-slate-800">{user?.email}</p>
        </div>
        <DropdownMenuSeparator className="my-2 bg-slate-100" />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center px-3 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
        >
          <LogOut className="ml-2 h-4 w-4" />
          <span>התנתקות מהמערכת</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
