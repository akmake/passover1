import axios from 'axios';
import { useAuthStore } from './stores/authStore';

// --- התיקון: שימוש במשתנה סביבה במקום כתובת קבועה ---
// אם מוגדר VITE_API_BASE_URL (בקובץ .env) נשתמש בו, אחרת ברירת מחדל ל-Localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

console.log('🔌 API Base URL being used:', baseURL); // לוג כדי שתוכל לוודא בקונסול שזה עובד

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
                // שימוש ב-baseURL המפורש לרענון הטוקן
                const { data: refreshedUserData } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
                useAuthStore.getState().login(refreshedUserData);

                // עדכון ה-baseURL לבקשה החוזרת כדי למנוע שימוש בכתובת שגויה
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
