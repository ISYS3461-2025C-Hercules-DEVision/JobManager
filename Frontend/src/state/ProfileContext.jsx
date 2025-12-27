import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { profileService } from "../modules/profile/services/profileService";
import { useAuth } from "./AuthContext";

/**
 * Profile Context
 * Manages company profile state globally
 */

const ProfileContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Load company profile and public profile
   */
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get complete profile (both company and public profile)
      const data = await profileService.getCompleteProfile();

      setProfile(data.companyProfile);
      setPublicProfile(data.publicProfile);
      setHasPublicProfile(data.hasPublicProfile);
    } catch (err) {
      console.error("Failed to load profile:", err);

      // Check if this is a "profile not found" error (new user)
      if (
        err.message?.includes("Company not found") ||
        err.message?.includes("404")
      ) {
        console.log(
          "Company profile not yet created - this is expected for new users"
        );
        // Don't set error state for new users without profiles yet
        setProfile(null);
        setPublicProfile(null);
        setHasPublicProfile(false);
      } else {
        // Real error - set error state
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Check if user has completed public profile setup
   */
  const checkProfileStatus = useCallback(async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const status = await profileService.checkProfileStatus();
      setHasPublicProfile(status.hasPublicProfile);
      return status.hasPublicProfile;
    } catch (err) {
      console.error("Failed to check profile status:", err);
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Update company profile
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedProfile = await profileService.updateCompanyProfile(
        profileData
      );
      setProfile(updatedProfile);

      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Failed to update profile");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create public profile (first-time setup)
   */
  const createPublicProfile = useCallback(async (publicProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const newPublicProfile = await profileService.createPublicProfile(
        publicProfileData
      );
      setPublicProfile(newPublicProfile);
      setHasPublicProfile(true);

      return { success: true, data: newPublicProfile };
    } catch (err) {
      console.error("Failed to create public profile:", err);
      setError(err.message || "Failed to create public profile");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update public profile
   */
  const updatePublicProfile = useCallback(async (publicProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedPublicProfile = await profileService.updatePublicProfile(
        publicProfileData
      );
      setPublicProfile(updatedPublicProfile);

      return { success: true, data: updatedPublicProfile };
    } catch (err) {
      console.error("Failed to update public profile:", err);
      setError(err.message || "Failed to update public profile");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(() => {
    return loadProfile();
  }, [loadProfile]);

  /**
   * Clear profile data (on logout)
   */
  const clearProfile = useCallback(() => {
    setProfile(null);
    setPublicProfile(null);
    setHasPublicProfile(false);
    setError(null);
  }, []);

  // Load profile on mount or when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      clearProfile();
      setRetryCount(0);
    }
  }, [isAuthenticated, loadProfile, clearProfile]);

  // Retry loading profile if it failed to load initially (for new users)
  useEffect(() => {
    if (isAuthenticated && !profile && !loading && !error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying profile load (attempt ${retryCount + 1}/3)...`);
        setRetryCount((prev) => prev + 1);
        loadProfile();
      }, 2000); // Retry every 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, profile, loading, error, retryCount, loadProfile]);

  const value = {
    // State
    profile,
    publicProfile,
    hasPublicProfile,
    loading,
    error,

    // Methods
    loadProfile,
    checkProfileStatus,
    updateProfile,
    createPublicProfile,
    updatePublicProfile,
    refreshProfile,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
