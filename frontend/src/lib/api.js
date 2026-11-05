import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables browser to automatically transmit HttpOnly refreshToken cookie
});

// Flag and queue for simultaneous request handling during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach Access Token from Redux Store state
api.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const token = state.auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // In case store is initializing
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Silent Refresh on 401 using HttpOnly Refresh Cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry on login or refresh endpoints to avoid infinite loops
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        // If a refresh is already underway, push to queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('seemanchal_refresh_token')
            : null;

        // Call backend /api/auth/refresh-token with HttpOnly cookie and body fallback
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedToken },
          { withCredentials: true }
        );

        if (res.data.success && res.data.accessToken) {
          const { accessToken, user, refreshToken } = res.data;

          if (refreshToken && typeof window !== 'undefined') {
            localStorage.setItem('seemanchal_refresh_token', refreshToken);
          }

          // Update Redux Store with new short-lived Access Token & User details
          store.dispatch(setCredentials({ accessToken, user }));

          // Process queued requests
          processQueue(null, accessToken);

          // Retry the failed original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('seemanchal_has_session');
          localStorage.removeItem('seemanchal_refresh_token');
        }
        // Refresh token is expired or invalid -> log user out in Redux
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
