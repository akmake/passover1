import { create } from 'zustand';

const getInitialState = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return { user, isAuthenticated: !!user };
  } catch (error) {
    return { user: null, isAuthenticated: false };
  }
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
  // --- התחלה: פונקציה חדשה לעדכון המשתמש ---
  updateUser: (updatedData) => {
    set((state) => {
      // מיזוג של המידע החדש עם המידע הקיים של המשתמש
      const newUser = { ...state.user, ...updatedData };
      // שמירה מעודכנת ב-localStorage ובמצב
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
  // --- סיום: פונקציה חדשה ---
}));