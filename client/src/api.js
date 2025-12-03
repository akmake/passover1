// client/src/api.js
import axios from 'axios';
import { useAuthStore } from './stores/authStore';

const api = axios.create({
    withCredentials: true,
});

// שליפת CSRF token לפני בקשות
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
        try {
            const response = await axios.get('/api/auth/csrf-token', { withCredentials: true });
            config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
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
                const { data: refreshedUserData } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                useAuthStore.getState().login(refreshedUserData);
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