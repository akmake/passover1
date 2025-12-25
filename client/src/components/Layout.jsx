// client/src/components/Layout.jsx

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import CartSlideOver from './CartSlideOver';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/'; // בדיקה האם המשתמש בדף הבית

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col pt-24">
      <CartSlideOver />

      {/* התפריט העליון - נשאר קבוע */}
      <Navbar />

      {/* לוגיקה לקביעת המחלקות של התוכן הראשי:
          1. אם זה אדמין: ריפוד רגיל של דף ניהול.
          2. אם זה דף הבית: רוחב מלא (w-full) וללא ריפוד (p-0) כדי שהתמונות יתחילו מיד.
          3. שאר הדפים הציבוריים (תפריט וכו'): מקבלים container וריפוד כדי שהתוכן לא יידבק לקצוות.
      */}
      <main className={`flex-grow ${
          isAdminPage
            ? 'px-4 py-8 lg:px-8'
            : isHomePage
              ? 'w-full p-0'
              : 'container mx-auto px-4 py-8'
        }`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
