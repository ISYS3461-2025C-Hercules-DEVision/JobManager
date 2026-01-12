import { httpClient } from "../../../utils/HttpUtil";
import { ENV } from "../../../config/env";

const APPLICATION_BASE_URL = `${ENV.APPLICATION_SERVICE_URL}/api/v1/applications`;
const APPLICANT_BASE_URL = `${ENV.APPLICANT_SERVICE_URL}/api/v1/applicants`;

/**
 * Application Service
 * Handles job application management
 */
export const applicationService = {
  /**
   * Get all applications for a specific job post
   * @param {string} jobPostId - Job Post ID
   * @returns {Promise<Array>} List of applications (AppliedApplicationDTO[])
   */
  async getApplicationsForJobPost(jobPostId) {
    try {
      const response = await httpClient.get(
        `${APPLICATION_BASE_URL}/job-posts/${jobPostId}/applied`
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
   * Get application details by ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Application details with documents
   */
  async getApplicationById(applicationId) {
    try {
      const response = await httpClient.get(
        `${APPLICATION_BASE_URL}/${applicationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch application:", error);
      throw error;
    }
  },

  /**
   * Update application status (Approve/Reject/etc)
   * @param {string} jobPostId - Job Post ID
   * @param {string} applicationId - Application ID
   * @param {string} newStatus - New status (APPROVED, REJECTED, etc)
   * @param {string} feedback - Optional feedback message
   * @returns {Promise<Object>} Updated application
   */
  async updateApplicationStatus(jobPostId, applicationId, newStatus, feedback = null) {
    try {
      const response = await httpClient.patch(
        `${APPLICATION_BASE_URL}/job-posts/${jobPostId}/applications/status`,
        {
          applicationId,
          newStatus,
          feedback,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update application status:", error);
      throw error;
    }
  },

  /**
   * Approve an application
   * @param {string} jobPostId - Job Post ID
   * @param {string} applicationId - Application ID
   * @param {string} feedback - Optional feedback message
   * @returns {Promise<Object>} Updated application
   */
  async approveApplication(jobPostId, applicationId, feedback = "Application approved") {
    return this.updateApplicationStatus(jobPostId, applicationId, "APPROVED", feedback);
  },

  /**
   * Reject an application
   * @param {string} jobPostId - Job Post ID
   * @param {string} applicationId - Application ID
   * @param {string} feedback - Optional feedback message
   * @returns {Promise<Object>} Updated application
   */
  async rejectApplication(jobPostId, applicationId, feedback = "Application rejected") {
    return this.updateApplicationStatus(jobPostId, applicationId, "REJECTED", feedback);
  },
};
