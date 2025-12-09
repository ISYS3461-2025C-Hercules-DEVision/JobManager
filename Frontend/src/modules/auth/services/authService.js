import { httpClient } from '../../../utils/HttpUtil';
import { saveToken, getToken, removeToken } from '../../../utils/tokenStorage';

/**
 * Authentication Service
 * Handles all API calls related to authentication
 */

export const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    try {
      const response = await httpClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        saveToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Register new user/company
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    try {
      const response = await httpClient.post('/auth/register', userData);
      
      if (response.data.token) {
        saveToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Login with Google OAuth
   * @param {string} googleToken - Google OAuth token
   * @returns {Promise<Object>} User data and token
   */
  async loginWithGoogle(googleToken) {
    try {
      const response = await httpClient.post('/auth/google', { token: googleToken });
      
      if (response.data.token) {
        saveToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await httpClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response message
   */
  async forgotPassword(email) {
    try {
      const response = await httpClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  },

  /**
   * Reset password with token
   * @param {Object} data - Reset password data
   * @param {string} data.token - Reset token
   * @param {string} data.password - New password
   * @returns {Promise<Object>} Response message
   */
  async resetPassword(data) {
    try {
      const response = await httpClient.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Response message
   */
  async verifyEmail(token) {
    try {
      const response = await httpClient.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!getToken();
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const response = await httpClient.post('/auth/refresh');
      
      if (response.data.token) {
        saveToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      removeToken();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }
};

export default authService;
