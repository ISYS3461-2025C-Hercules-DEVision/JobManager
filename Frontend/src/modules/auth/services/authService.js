import { httpClient } from "../../../utils/HttpUtil";
import { saveToken, getToken, removeToken } from "../../../utils/tokenStorage";
import { API_ENDPOINTS } from "../../../config/api";
import { ENV } from "../../../config/env";

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
   * @returns {Promise<string>} JWT token
   */
  async login(credentials) {
    try {
      // Backend expects username field, but we use email
      const loginData = {
        username: credentials.email,
        password: credentials.password,
      };

      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      // Backend returns token as plain string
      if (response.data) {
        const token = response.data;
        saveToken(token);
        return token;
      }

      throw new Error("No token received from server");
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Login failed"
      );
    }
  },

  /**
   * Register new user/company
   * @param {Object} userData - User registration data
   * @returns {Promise<void>}
   */
  async register(userData) {
    try {
      // Mock mode: simulate success without calling backend
      // if (ENV.MOCK_AUTH) {
      //   await new Promise((r) => setTimeout(r, 400));
      //   return { success: true };
      // }

      const registerData = {
        companyName: userData.companyName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        city: userData.city,
        address: userData.streetAddress,
      };

      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        registerData
      );

      // Registration successful - backend returns 200 OK
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Registration failed"
      );
    }
  },

  /**
   * Verify email with OTP code
   * @param {Object} verifyData - Verification data
   * @param {string} verifyData.email - User email
   * @param {string} verifyData.code - OTP code
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(verifyData) {
    try {
      // Mock mode: simulate verification success without calling backend
      // if (ENV.MOCK_AUTH) {
      //   await new Promise((r) => setTimeout(r, 300));
      //   return { verified: true };
      // }

      const response = await httpClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        userName: verifyData.email,
        code: verifyData.code,
      });

      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Email verification failed"
      );
    }
  },

  /**
   * Resend verification code
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resendVerification(email) {
    try {
      await httpClient.post(
        `${API_ENDPOINTS.AUTH.RESEND_VERIFICATION}?email=${email}`
      );
    } catch (error) {
      console.error("Resend verification error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to resend verification code"
      );
    }
  },

  /**
   * Login with Google OAuth
   * @param {string} code - Google OAuth authorization code
   * @returns {Promise<string>} JWT token
   */
  async loginWithGoogle(code) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
        code,
      });

      if (response.data) {
        console.log(response.data);
        const token = response.data.accessToken;
        saveToken(token);
        return token;
      }

      throw new Error("No token received from server");
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Google login failed"
      );
    }
  },

  /**
   * Signup with Google OAuth
   * Initiates Google OAuth flow for registration
   * @returns {Promise<void>}
   */
  async signupWithGoogle() {
    try {
      // Get Google Client ID from environment
      const googleClientId = "34789659364-001rbq54i0jb3ge69kqes55pgcoklek9.apps.googleusercontent.com";

      if (!googleClientId) {
        throw new Error(
          "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file."
        );
      }

      // Build OAuth URL
      const redirectUri = `${window.location.origin}/login/oauth2/code/google`;
      const scope = "email profile";
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Google signup error:", error);
      throw new Error(error.message || "Failed to initiate Google signup");
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Just remove token locally (backend doesn't have logout endpoint)
      removeToken();
    } catch (error) {
      console.error("Logout error:", error);
      removeToken(); // Always clear token even if request fails
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get user profile"
      );
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated() {
    return !!getToken();
  },
};
