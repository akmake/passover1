// client/src/App.jsx

import { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminProductCreatePage from './pages/admin/AdminProductCreatePage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminUserListPage from './pages/admin/AdminUserListPage';
import AdminRoute from './components/AdminRoute';
import AdminPackageListPage from './pages/admin/AdminPackageListPage';
import AdminPackageCreatePage from './pages/admin/AdminPackageCreatePage';
import AdminPackageEditPage from './pages/admin/AdminPackageEditPage';
import PackageBuilderPage from './pages/PackageBuilderPage';
import AdminDeliveryReportPage from './pages/admin/AdminDeliveryReportPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminPreparationReportPage from './pages/admin/AdminPreparationReportPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminHomepageSettingsPage from './pages/admin/AdminHomepageSettingsPage';
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminCouponListPage from './pages/admin/AdminCouponListPage';
import AdminCouponFormPage from './pages/admin/AdminCouponFormPage';
import HomePageManage from './pages/admin/HomePageManage';
import AdminPromotions from './pages/admin/AdminPromotions';

// הייבוא של הדף החדש
import BridalHomePage from './pages/BridalHomePage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir(i18n.language);
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'inherit',
            borderRadius: '8px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: { primary: '#D4AF37', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            duration: 4500,
          },
        }}
      />
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">טוען...</div>}>
        <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          
          <Route path="menu" element={<MenuPage />} />
          {/* הנה הנתיב החדש - בדיוק כמו שביקשת, חלק מהרשימה */}
          <Route path="bridal" element={<BridalHomePage />} />
          
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="order-success/:id" element={<OrderSuccessPage />} />
          <Route path="package/:id" element={<PackageBuilderPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="my-orders" element={<OrderHistoryPage />} />
          <Route path="my-orders/:id" element={<OrderDetailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />

          {/* Admin Routes (Nested) */}
          <Route path="admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductListPage />} />
              <Route path="products/new" element={<AdminProductCreatePage />} />
              <Route path="products/:id/edit" element={<AdminProductEditPage />} />
              <Route path="users" element={<AdminUserListPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="packages" element={<AdminPackageListPage />} />
              <Route path="packages/new" element={<AdminPackageCreatePage />} />
              <Route path="packages/:id/edit" element={<AdminPackageEditPage />} />
              <Route path="categories" element={<AdminCategoryListPage />} />
              <Route path="reports/preparation" element={<AdminPreparationReportPage />} />
              <Route path="reports/delivery" element={<AdminDeliveryReportPage />} />
              <Route path="orders" element={<AdminOrderListPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="homepage-settings" element={<AdminHomepageSettingsPage />} />
              <Route path="coupons" element={<AdminCouponListPage />} />
              <Route path="coupons/new" element={<AdminCouponFormPage />} />
              <Route path="coupons/:id/edit" element={<AdminCouponFormPage />} />
              <Route path="homepage" element={<HomePageManage />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}

export default App;