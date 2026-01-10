/**
 * useProfile Hook
 * Custom hook for managing company profile state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';

/**
 * Custom hook for managing company profile
 * Handles fetching, updating, and state management for company profiles
 */
export const useProfile = () => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Fetch complete profile data
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await profileService.getCompleteProfile();
      setCompanyProfile(data.company);
      setPublicProfile(data.publicProfile);
      setHasPublicProfile(data.hasPublicProfile);
      setIsInitialized(true);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch only company profile
   */
  const fetchCompanyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await profileService.getCompanyProfile();
      setCompanyProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch company profile';
      setError(errorMessage);
      console.error('Company profile fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch only public profile
   */
  const fetchPublicProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await profileService.getPublicProfile();
      setPublicProfile(data);
      setHasPublicProfile(true);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch public profile';
      setError(errorMessage);
      console.error('Public profile fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update company profile
   */
  const updateCompanyProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileService.updateCompanyProfile(profileData);
      setCompanyProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update company profile';
      setError(errorMessage);
      console.error('Company profile update error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create public profile (first-time setup)
   */
  const createPublicProfile = useCallback(async (publicProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const createdProfile = await profileService.createPublicProfile(publicProfileData);
      setPublicProfile(createdProfile);
      setHasPublicProfile(true);
      return { success: true, data: createdProfile };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create public profile';
      setError(errorMessage);
      console.error('Public profile creation error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update public profile
   */
  const updatePublicProfile = useCallback(async (publicProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileService.updatePublicProfile(publicProfileData);
      setPublicProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update public profile';
      setError(errorMessage);
      console.error('Public profile update error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check profile status
   */
  const checkProfileStatus = useCallback(async () => {
    try {
      const status = await profileService.checkProfileStatus();
      setHasPublicProfile(status.hasPublicProfile);
      return status;
    } catch (err) {
      console.error('Profile status check error:', err);
      throw err;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all profile data
   */
  const refreshProfile = useCallback(async () => {
    return await fetchProfile();
  }, [fetchProfile]);

  // Auto-fetch profile on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchProfile().catch((err) => {
        console.error('Initial profile fetch failed:', err);
      });
    }
  }, [isInitialized, fetchProfile]);

  return {
    // State
    companyProfile,
    publicProfile,
    hasPublicProfile,
    loading,
    error,
    isInitialized,

    // Methods
    fetchProfile,
    fetchCompanyProfile,
    fetchPublicProfile,
    updateCompanyProfile,
    createPublicProfile,
    updatePublicProfile,
    checkProfileStatus,
    refreshProfile,
    clearError,
  };
};

