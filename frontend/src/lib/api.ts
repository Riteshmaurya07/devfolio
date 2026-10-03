import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/users/login') ||
      originalRequest?.url?.includes('/users/register') ||
      originalRequest?.url?.includes('/users/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${baseURL}/users/refresh`,
          {},
          { withCredentials: true }
        );
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().login(currentUser, data.access_token);
        } else {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(new Error('No user found during refresh'));
        }
        
        // Safely set the new token for the retry
        if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set("Authorization", `Bearer ${data.access_token}`);
        } else if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
