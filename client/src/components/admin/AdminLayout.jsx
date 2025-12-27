import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Package, Box, LayoutGrid,
  Ticket, FileText, Truck, Users, Home, Settings,
  Menu, X, LogOut, ChevronDown, Bell
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/Dropdown-menu"; // ודא שהשם תואם לקובץ אצלך
import api from '@/api';

// --- הגדרות עיצוב יוקרתי ---
const GOLD = "#D4AF37";
const BLACK = "#050505";

// הזרקת הפונטים גם לפאנל הניהול
const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap');
      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
    `}
  </style>
);

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
    title: 'דוחות ולוגיסטיקה',
    items: [
      { to: '/admin/reports/preparation', label: 'דוח ייצור', icon: FileText },
      { to: '/admin/reports/deliveries', label: 'דוח משלוחים', icon: Truck },
    ]
  },
  {
    title: 'מערכת ותוכן',
    items: [
      { to: '/admin/users', label: 'משתמשים', icon: Users },
      { to: '/admin/homepage', label: 'עיצוב דף הבית', icon: Home }, // <-- התיקון החשוב: מפנה לממשק שבנינו
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
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-montserrat text-slate-900" dir="rtl">
      <FontsInjection />

      {/* 1. Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:right-0 bg-white border-l border-slate-100 shadow-xl shadow-slate-200/50 z-50">
        <SidebarContent user={user} logout={handleLogout} />
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 md:pr-72 flex flex-col min-h-screen transition-all duration-300">

        {/* Top Header */}


        {/* 3. Page Content */}
        <main className="p-6 lg:p-10 flex-grow bg-[#F8F9FA]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-72 md:hidden shadow-2xl bg-white"
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
    <div className="flex flex-col h-full bg-white relative">
      {/* Sidebar Header */}
      <div className="p-8 border-b border-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* רקע עדין לכותרת */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] to-white opacity-50 z-0"></div>
        
        <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase mb-1 block">Admin Console</span>
            <h1 className="text-2xl font-cinzel font-bold tracking-[0.15em] text-[#050505] leading-none">ALI ZAHAV</h1>
            <span className="text-[9px] tracking-[0.4em] text-slate-400 mt-2 uppercase font-light block">Luxury Events</span>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 left-4 md:hidden z-20">
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {adminGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
               <span className="w-1 h-1 bg-[#D4AF37] rounded-full inline-block"></span>
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

      {/* Sidebar Footer */}
      <div className="p-4 text-center text-[10px] text-slate-300 tracking-widest uppercase hidden md:block">
        v1.0.0 • Ali Zahav
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
        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 border border-transparent
        ${isActive
          ? "bg-[#050505] text-[#D4AF37] shadow-lg shadow-black/10 translate-x-1"
          : "text-slate-500 hover:bg-[#FFFDF5] hover:text-[#050505] hover:border-[#D4AF37]/20"}
      `}
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`ml-3 h-5 w-5 transition-transform duration-300 ${
              isActive ? "text-[#D4AF37]" : "text-slate-400 group-hover:text-[#D4AF37] group-hover:scale-110"
            }`}
          />
          <span className="tracking-wide">{item.label}</span>
          {isActive && (
              <div className="mr-auto w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
          )}
        </>
      )}
    </NavLink>
  );
}

