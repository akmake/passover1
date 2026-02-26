import axios from 'axios';
import { useAuthStore } from './stores/authStore';

// --- הגדרת כתובת השרת ---
// משתמש ב-VITE_API_BASE_URL מקובץ .env או fallback
const getBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || (
        window.location.hostname === 'localhost'
            ? 'https://localhost:5000'
            : `${window.location.origin}`
    );
};

const baseURL = getBaseUrl();

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// --- Interceptors (טיפול בטוקנים ושגיאות) ---
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
        try {
            // שים לב: הוספתי /api גם כאן
            const response = await axios.get(`${baseURL}/api/auth/csrf-token`, { withCredentials: true });
            config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            // התעלמות שקטה אם אין CSRF כרגע
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // נתיב רענון עם /api
                const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
                useAuthStore.getState().login(data);
                originalRequest.baseURL = baseURL;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- פונקציות API (התיקון הקריטי) ---

export const getProducts = async () => {
    // הוספתי את ה-/api שהיה חסר וגרם ל-404
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

// הוסף את שאר הפונקציות לפי הצורך, תמיד עם /api בהתחלה
export const createOrder = async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
};

export default api;