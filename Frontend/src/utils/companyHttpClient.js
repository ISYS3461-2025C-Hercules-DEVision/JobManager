/**
 * Company Service HTTP Client
 * Axios instance specifically for company microservice
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { getToken, removeToken } from './tokenStorage';

/**
 * Create axios instance for company service
 */
export const companyHttpClient = axios.create({
  baseURL: ENV.COMPANY_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds authentication token to requests
 */
companyHttpClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (ENV.IS_DEV) {
      console.log('🏢 Company API Request:', {
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
companyHttpClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (ENV.IS_DEV) {
      console.log('✅ Company API Response:', {
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
      console.error('❌ Company API Error:', {
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
 * Company API request wrapper functions
 */
export const companyApi = {
  get: (url, config) => companyHttpClient.get(url, config),
  post: (url, data, config) => companyHttpClient.post(url, data, config),
  put: (url, data, config) => companyHttpClient.put(url, data, config),
  patch: (url, data, config) => companyHttpClient.patch(url, data, config),
  delete: (url, config) => companyHttpClient.delete(url, config),
};

