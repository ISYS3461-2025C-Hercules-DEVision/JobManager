import { httpClient } from "../../../utils/HttpUtil";
import { ENV } from "../../../config/env";

const APPLICATION_BASE_URL = `${ENV.API_BASE_URL}/api/v1/applications`;
const APPLICANT_BASE_URL = "http://13.210.119.17:10789/api/v1/applicants";

/**
 * Application Service
 * Handles job application management
 */
export const applicationService = {
  /**
   * Get all applications for a specific job post
   * @param {string} companyId - Company ID
   * @param {string} jobPostId - Job Post ID
   * @returns {Promise<Array>} List of applications
   */
  async getApplicationsForJobPost(companyId, jobPostId) {
    try {
      const response = await httpClient.get(
        `${APPLICATION_BASE_URL}/${companyId}/job-posts/${jobPostId}/applications`
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      throw error;
    }
  },

  /**
   * Get applicant details by ID
   * @param {string} applicantId - Applicant ID
   * @returns {Promise<Object>} Applicant details
   */
  async getApplicantById(applicantId) {
    try {
      const response = await fetch(`${APPLICANT_BASE_URL}/${applicantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch applicant details");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch applicant:", error);
      throw error;
    }
  },

  /**
   * Approve an application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async approveApplication(applicationId) {
    try {
      const response = await httpClient.post(
        `${APPLICATION_BASE_URL}/${applicationId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to approve application:", error);
      throw error;
    }
  },

  /**
   * Reject an application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async rejectApplication(applicationId) {
    try {
      const response = await httpClient.post(
        `${APPLICATION_BASE_URL}/${applicationId}/reject`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reject application:", error);
      throw error;
    }
  },
};
