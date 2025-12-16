/**
 * HTTP Client Utility
 * Axios instance with interceptors for authentication
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { getToken, removeToken } from './tokenStorage';

/**
 * Create axios instance with base configuration
 */
export const httpClient = axios.create({
  baseURL: ENV.AUTH_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds authentication token to requests
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (ENV.IS_DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles responses and errors globally
 */
httpClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (ENV.IS_DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (ENV.IS_DEV) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear tokens and redirect to login
      removeToken();
      window.location.href = '/login';

      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * API request wrapper functions
 */
export const api = {
  get: (url, config) => httpClient.get(url, config),
  post: (url, data, config) => httpClient.post(url, data, config),
  put: (url, data, config) => httpClient.put(url, data, config),
  patch: (url, data, config) => httpClient.patch(url, data, config),
  delete: (url, config) => httpClient.delete(url, config),
};

