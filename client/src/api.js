import axios from 'axios';
import { useAuthStore } from './stores/authStore';

// קביעת כתובת הבסיס
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
console.log('🔌 API Base URL being used:', baseURL);

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// --- Interceptors (נשאר זהה) ---

// שליפת CSRF token
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
        try {
            const response = await axios.get(`${baseURL}/api/auth/csrf-token`, { withCredentials: true });
            config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }
    return config;
});

// רענון טוקן אוטומטי
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data: refreshedUserData } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
                useAuthStore.getState().login(refreshedUserData);
                originalRequest.baseURL = baseURL;
                return api(originalRequest);
            } catch (refreshError) {
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

// --- פונקציות API (החלק החסר) ---

export const getProducts = async () => {
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

export default api;