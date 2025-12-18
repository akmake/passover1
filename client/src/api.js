import axios from 'axios';
import { useAuthStore } from './stores/authStore';

// קביעת כתובת ה-API באופן דינמי
// בייצור (Render) זה ייקח את הכתובת מהמשתנה, בפיתוח זה יהיה localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || 
                (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://passover1.onrender.com');

console.log('🔌 API Base URL:', baseURL);

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true, // חובה בשביל Cookies/Session
});

// --- Interceptors ---

// 1. הוספת CSRF Token לכל בקשת שינוי (POST/PUT/DELETE)
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
        try {
            // ניסיון לשלוף את הטוקן מקוקי או מהשרת אם צריך
            // כאן הנחנו שהשרת מספק אנדפוינט לזה, או שהקוקי נשלח אוטומטית
            // במידה ויש אנדפוינט ספציפי:
             const response = await axios.get(`${baseURL}/api/auth/csrf-token`, { withCredentials: true });
             config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            // התעלמות משגיאה ב-GET פשוט, אך לוג אם זה קריטי
            // console.warn('CSRF token fetch failed', error);
        }
    }
    return config;
});

// 2. טיפול בשגיאות 401 (התנתקות/רענון טוקן)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // מניעת לולאה אינסופית
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // נתיב רענון הטוקן חייב גם הוא לכלול /api
                const { data: refreshedUserData } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
                
                // עדכון הסטייט עם המשתמש החדש
                useAuthStore.getState().login(refreshedUserData);
                
                // עדכון ה-baseURL של הבקשה החוזרת
                originalRequest.baseURL = baseURL;
                return api(originalRequest);
            } catch (refreshError) {
                // אם הרענון נכשל - ניתוק המשתמש
                useAuthStore.getState().logout();
                if (window.location.pathname !== '/login') {
                    // window.location.href = '/login'; // אופציונלי: הפניה לדף התחברות
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- פונקציות API מתוקנות (הוספת /api) ---

export const getProducts = async () => {
    // התיקון הקריטי: הוספת /api לפני products
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

// ניתן להוסיף כאן עוד פונקציות לפי הצורך
export const createOrder = async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
};

export default api;