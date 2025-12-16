import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../modules/auth/services/authService';
import { getToken, removeToken } from '../utils/tokenStorage';

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth().catch(error => {
      console.error('Failed to check auth on mount:', error);
    });
  }, []);

  /**
   * Check if the user is authenticated
   */
  const checkAuth = async () => {
    try {
      const token = getToken();

      if (token) {
        // Token exists, try to get user profile
        // Note: Uncomment when backend /me endpoint is ready
        // const userData = await authService.getCurrentUser();
        // setUser(userData);

        // For now, just set authenticated if the token exists
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      await authService.login(credentials);

      // Token is already saved by authService
      setIsAuthenticated(true);

      // Optionally fetch user profile
      // const userData = await authService.getCurrentUser();
      // setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Verify email with OTP
   */
  const verifyEmail = async (email, code) => {
    try {
      await authService.verifyEmail({ email, code });
      return { success: true };
    } catch (error) {
      console.error('Email verification failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Resend verification code
   */
  const resendVerification = async (email) => {
    try {
      await authService.resendVerification(email);
      return { success: true };
    } catch (error) {
      console.error('Resend verification failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update user profile
   */
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

