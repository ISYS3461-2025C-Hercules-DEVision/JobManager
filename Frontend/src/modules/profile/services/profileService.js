/**
 * Company Profile Service
 * Handles all company profile-related API calls
 */

import { companyApi } from '../../../utils/companyHttpClient';
import { API_ENDPOINTS } from '../../../config/api';

/**
 * Profile Service
 * Provides methods for managing company profiles and public profiles
 */
export const profileService = {
  /**
   * Check if user has completed public profile setup
   * @returns {Promise<{companyId: string, hasPublicProfile: boolean}>}
   */
  async checkProfileStatus() {
    try {
      const response = await companyApi.get(API_ENDPOINTS.COMPANY.PROFILE_STATUS);
      return response.data;
    } catch (error) {
      console.error('Failed to check profile status:', error);
      throw error;
    }
  },

  /**
   * Get company profile (basic company information)
   * @returns {Promise<Object>} Company profile data
   */
  async getCompanyProfile() {
    try {
      const response = await companyApi.get(API_ENDPOINTS.COMPANY.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch company profile:', error);
      throw error;
    }
  },

  /**
   * Update company basic information
   * @param {Object} profileData - Company profile data to update
   * @param {string} [profileData.name] - Company name
   * @param {string} [profileData.email] - Email
   * @param {string} [profileData.phoneNumber] - Phone number
   * @param {string} [profileData.address] - Street address
   * @param {string} [profileData.city] - City
   * @param {string} [profileData.country] - Country
   * @returns {Promise<Object>} Updated company profile
   */
  async updateCompanyProfile(profileData) {
    try {
      const response = await companyApi.put(API_ENDPOINTS.COMPANY.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update company profile:', error);
      throw error;
    }
  },

  /**
   * Create public profile (first-time onboarding)
   * @param {Object} publicProfileData - Public profile data
   * @param {string} publicProfileData.companyName - Display name for public
   * @param {string} [publicProfileData.logoUrl] - Logo URL
   * @param {string} [publicProfileData.bannerUrl] - Banner URL
   * @returns {Promise<Object>} Created public profile
   */
  async createPublicProfile(publicProfileData) {
    try {
      const response = await companyApi.post(API_ENDPOINTS.COMPANY.PUBLIC_PROFILE, publicProfileData);
      return response.data;
    } catch (error) {
      console.error('Failed to create public profile:', error);
      throw error;
    }
  },

  /**
   * Get public profile
   * @returns {Promise<Object>} Public profile data
   */
  async getPublicProfile() {
    try {
      const response = await companyApi.get(API_ENDPOINTS.COMPANY.PUBLIC_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
      throw error;
    }
  },

  /**
   * Update public profile (from settings page)
   * @param {Object} publicProfileData - Public profile data to update
   * @param {string} [publicProfileData.displayName] - Display name
   * @param {string} [publicProfileData.aboutUs] - About us description
   * @param {string} [publicProfileData.whoWeAreLookingFor] - Who we are looking for
   * @param {string} [publicProfileData.websiteUrl] - Website URL
   * @param {string} [publicProfileData.industryDomain] - Industry domain
   * @param {string} [publicProfileData.logoUrl] - Logo URL
   * @param {string} [publicProfileData.bannerUrl] - Banner URL
   * @returns {Promise<Object>} Updated public profile
   */
  async updatePublicProfile(publicProfileData) {
    try {
      const response = await companyApi.put(API_ENDPOINTS.COMPANY.UPDATE_PUBLIC_PROFILE, publicProfileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update public profile:', error);
      throw error;
    }
  },

  /**
   * Get complete company profile (both basic and public profile)
   * @returns {Promise<{companyProfile: Object, publicProfile: Object, hasPublicProfile: boolean}>}
   */
  async getCompleteProfile() {
    try {
      // Use Promise.allSettled to handle cases where profile doesn't exist yet
      const [companyResult, statusResult] = await Promise.allSettled([
        this.getCompanyProfile(),
        this.checkProfileStatus(),
      ]);

      // Handle company profile result
      if (companyResult.status === 'rejected') {
        const error = companyResult.reason;
        // If company not found (new user), return empty profile
        if (error.message?.includes('Company not found') || error.message?.includes('404')) {
          return {
            companyProfile: null,
            publicProfile: null,
            hasPublicProfile: false,
          };
        }
        // Other errors - rethrow
        throw error;
      }

      const company = companyResult.value;
      const status = statusResult.status === 'fulfilled' ? statusResult.value : { hasPublicProfile: false };

      let publicProfile = null;
      if (status.hasPublicProfile) {
        try {
          publicProfile = await this.getPublicProfile();
        } catch (err) {
          console.warn('Failed to fetch public profile:', err);
          // Continue without public profile
        }
      }

      return {
        companyProfile: company,
        publicProfile,
        hasPublicProfile: status.hasPublicProfile,
      };
    } catch (error) {
      console.error('Failed to fetch complete profile:', error);
      throw error;
    }
  },
};

