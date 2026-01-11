import { httpClient } from "../../../utils/HttpUtil";
import { ENV } from "../../../config/env";
import { API_ENDPOINTS } from "../../../config/api";

const baseUrl = ENV.JOB_SERVICE_URL;

const toSkillsArray = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Build payload matching backend JobPost entity structure
 */
const buildJobPayload = (formData) => {
  const payload = {
    title: formData.title,
    department: formData.department || "",
    description: formData.description,
    employmentTypes: Array.isArray(formData.employmentTypes) 
      ? formData.employmentTypes 
      : [formData.employmentTypes || "Full-time"],
    location: formData.location,
    salaryType: formData.salaryType || "NEGOTIABLE",
    salaryCurrency: formData.salaryCurrency || "USD",
    skills: toSkillsArray(formData.skills),
    published: formData.published !== undefined ? formData.published : true,
    experienceLevel: formData.experienceLevel || "",
    responsibilities: formData.responsibilities || "",
    requirements: formData.requirements || "",
    benefits: formData.benefits || "",
  };

  // Add salary values based on type
  if (formData.salaryType !== "NEGOTIABLE") {
    if (formData.salaryType === "RANGE" || formData.salaryType === "FROM" || formData.salaryType === "ABOUT") {
      payload.salaryMin = formData.salaryMin ? Number(formData.salaryMin) : null;
    }
    if (formData.salaryType === "RANGE" || formData.salaryType === "UP_TO") {
      payload.salaryMax = formData.salaryMax ? Number(formData.salaryMax) : null;
    }
  }

  // Add expiry date if provided
  if (formData.expiryDate) {
    payload.expiryDate = formData.expiryDate;
  }

  return payload;
};

export const jobService = {
  async listMyJobs() {
    const response = await httpClient.get(
      `${baseUrl}${API_ENDPOINTS.JOB.MY_JOBS}`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async createJob(formData) {
    const payload = buildJobPayload(formData);
    const response = await httpClient.post(
      `${baseUrl}${API_ENDPOINTS.JOB.CREATE}`,
      payload
    );
    return response.data;
  },

  async saveDraft(formData, jobId = null) {
    const payload = {
      ...buildJobPayload(formData),
      published: false, // Force draft status
    };

    if (jobId) {
      // Update existing draft
      const response = await httpClient.put(
        `${baseUrl}/jobs/${jobId}`,
        payload
      );
      return response.data;
    } else {
      // Create new draft
      const response = await httpClient.post(
        `${baseUrl}${API_ENDPOINTS.JOB.CREATE}`,
        payload
      );
      return response.data;
    }
  },

  async getJobById(jobId) {
    const response = await httpClient.get(`${baseUrl}/jobs/${jobId}`);
    return response.data;
  },

  async updateJob(jobId, formData) {
    const payload = buildJobPayload(formData);
    const response = await httpClient.put(`${baseUrl}/jobs/${jobId}`, payload);
    return response.data;
  },

  async deleteJob(jobId) {
    await httpClient.delete(`${baseUrl}/jobs/${jobId}`);
  },

  async bulkActivate(jobIds) {
    await httpClient.post(`${baseUrl}/jobs/bulk/activate`, jobIds);
  },

  async bulkClose(jobIds) {
    await httpClient.post(`${baseUrl}/jobs/bulk/close`, jobIds);
  },

  async bulkDelete(jobIds) {
    await httpClient.delete(`${baseUrl}/jobs/bulk/delete`, { data: jobIds });
  },
};
