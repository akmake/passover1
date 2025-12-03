import { create } from 'zustand';
import api from '@/api';
import debounce from 'lodash.debounce';
import { useAuthStore } from './authStore';

export const syncCartWithDB = debounce(async (items, isAuthenticated) => {
  if (isAuthenticated) {
    try {
      await api.put('/api/cart', { cartItems: items }, { withCredentials: true });
    } catch (error) { 
      console.error('Failed to sync cart with DB:', error); 
    }
  }
}, 1500);

export const useCartStore = create((set, get) => ({
  items: [],
  isCartOpen: false,
  setCart: (items) => set({ items }),
  clearCart: () => {
    set({ items: [] });
    syncCartWithDB([], useAuthStore.getState().isAuthenticated);
  },
  addToCart: (product, isAuthenticated) => {
    const { items } = get();
    const existingItem = items.find((item) => item.type === 'product' && item._id === product._id);
    let updatedItems;
    if (existingItem) {
      updatedItems = items.map((item) => item.type === 'product' && item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      updatedItems = [...items, { ...product, quantity: 1, type: 'product' }];
    }
    set({ items: updatedItems });
    syncCartWithDB(updatedItems, isAuthenticated);
  },
  addPackageToCart: (packageData) => {
    const newPackageItem = { ...packageData, type: 'package' };
    const updatedItems = [...get().items, newPackageItem];
    set({ items: updatedItems });
    syncCartWithDB(updatedItems, useAuthStore.getState().isAuthenticated);
  },
  removeFromCart: (itemId, isAuthenticated) => {
    const updatedItems = get().items.filter((item) => item._id !== itemId);
    set({ items: updatedItems });
    syncCartWithDB(updatedItems, isAuthenticated);
  },
  updateQuantity: (productId, quantity, isAuthenticated) => {
    const updatedItems = get().items
      .map((item) => item.type === 'product' && item._id === productId ? { ...item, quantity: Math.max(0, quantity) } : item)
      .filter((item) => (item.type === 'product' && item.quantity > 0) || item.type === 'package');
    set({ items: updatedItems });
    syncCartWithDB(updatedItems, isAuthenticated);
  },
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  closeCart: () => set({ isCartOpen: false }),
  fetchCartFromDB: async () => {
    try {
      const { data: cartFromServer } = await api.get('/api/cart', { withCredentials: true });
      const clientCartItems = cartFromServer
        .filter(serverItem => serverItem.item) 
        .map(serverItem => {
          if (serverItem.itemType === 'MealPackage') {
            return {
              ...serverItem.item,
              _id: serverItem.item._id,
              type: 'package',
              userChoices: serverItem.packageSelections
            };
          }
          return {
            ...serverItem.item,
            _id: serverItem.item._id,
            quantity: serverItem.quantity,
            type: 'product'
          };
        });
      set({ items: clientCartItems });
    } catch (error) { 
      console.error("Failed to fetch cart from DB, clearing local cart.", error);
      set({ items: [] });
    }
  },
}));