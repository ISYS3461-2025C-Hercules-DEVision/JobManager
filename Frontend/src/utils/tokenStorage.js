/**
 * Token Storage Utility
 * Handles storage and retrieval of authentication tokens
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Save access token to localStorage
 * @param {string} token - Access token
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Save refresh token to localStorage
 * @param {string} token - Refresh token
 */
export const saveRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} Access token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove all tokens from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if access token exists
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Save both tokens at once
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 */
export const saveTokens = (accessToken, refreshToken) => {
  saveToken(accessToken);
  saveRefreshToken(refreshToken);
};

