/// <reference types="vite/client" />
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Resolve base URL for Vite, Next.js, or local fallback
const getBaseUrl = (): string => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (metaEnv?.VITE_API_BASE_URL) {
    return metaEnv.VITE_API_BASE_URL;
  }
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return 'http://localhost:8080/api/v1';
};

export const BASE_URL = getBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Inject Authorization JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag & queue to handle concurrent 401 refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Extract data envelope & handle 401 Auto-Refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors and attempt token refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          try {
            // Call refresh token endpoint directly via un-intercepted axios call
            const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const newAccessToken = refreshRes.data?.data?.token;

            if (newAccessToken) {
              localStorage.setItem('access_token', newAccessToken);
              if (refreshRes.data?.data?.refreshToken) {
                localStorage.setItem('refresh_token', refreshRes.data.data.refreshToken);
              }

              apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }

              processQueue(null, newAccessToken);
              isRefreshing = false;

              return apiClient(originalRequest);
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
              window.location.href = '/';
            }
            return Promise.reject(refreshErr);
          }
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/';
          }
        }
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
