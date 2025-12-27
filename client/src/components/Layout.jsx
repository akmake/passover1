// client/src/components/Layout.jsx

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import CartSlideOver from './CartSlideOver';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col pt-24">
      <CartSlideOver />

      {/* התפריט העליון */}
      <Navbar />

      {/* שינוי: כעת כל הדפים מקבלים w-full (רוחב מלא).
          ההבדל היחיד הוא ה-Padding (ריפוד):
          - דף הבית: ללא ריפוד בכלל (p-0).
          - כל שאר הדפים (כולל אדמין ודפים רגילים): מקבלים ריפוד כדי שהטקסט לא יידבק לקצה.
      */}
      <main className={`flex-grow w-full ${
          isHomePage 
            ? 'p-0' 
            : 'px-1 py-4 lg:px-4'
        }`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;