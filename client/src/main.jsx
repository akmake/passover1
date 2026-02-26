import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { useCartStore } from './stores/cartStore.js';
import './i18n'; // <-- זו השורה החשובה שהייתה חסרה

// --- הוספות חדשות ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// יצירת "מנהל" חדש עבור כל האפליקציה
const queryClient = new QueryClient();
// --- סוף הוספות ---

// --- הגשר בין החנויות ---
useAuthStore.subscribe(
  (state, prevState) => {
    if (state.isAuthenticated && !prevState.isAuthenticated) {
      useCartStore.getState().fetchCartFromDB();
    } else if (!state.isAuthenticated && prevState.isAuthenticated) {
      useCartStore.getState().setCart([]);
    }
  }
);

if (useAuthStore.getState().isAuthenticated) {
  useCartStore.getState().fetchCartFromDB();
}
// --- סוף הגשר ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- עטיפה של האפליקציה בפרויידר החדש --- */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);