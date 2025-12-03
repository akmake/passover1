import axios from 'axios';
import { useAuthStore } from './stores/authStore';

// תיקון "כוח גס": אם המשתנה לא נקלט, השתמש בכתובת השרת הישירה
const baseURL = 'https://passover1.onrender.com';
console.log('🔌 API Base URL being used:', baseURL); // לוג כדי שתוכל לראות בקונסול

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// שליפת CSRF token לפני בקשות POST/PUT/DELETE
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
        try {
            // שימוש ב-baseURL המפורש
            const response = await axios.get(`${baseURL}/api/auth/csrf-token`, { withCredentials: true });
            config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }
    return config;
});

// טיפול ב-Token Refresh אוטומטי
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // שימוש ב-baseURL המפורש
                const { data: refreshedUserData } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
                useAuthStore.getState().login(refreshedUserData);
                
                // עדכון ה-baseURL לבקשה החוזרת
                originalRequest.baseURL = baseURL;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Session refresh failed. Logging out.");
                useAuthStore.getState().logout();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;