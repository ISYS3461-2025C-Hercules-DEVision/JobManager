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

const buildSalaryString = (salaryMin, salaryMax) => {
  const min = salaryMin !== "" && salaryMin != null ? Number(salaryMin) : null;
  const max = salaryMax !== "" && salaryMax != null ? Number(salaryMax) : null;

  if (Number.isFinite(min) && Number.isFinite(max)) return `${min}-${max} USD`;
  if (Number.isFinite(min)) return `From ${min} USD`;
  if (Number.isFinite(max)) return `Up to ${max} USD`;
  return "";
};

export const jobService = {
  async listMyJobs() {
    const response = await httpClient.get(
      `${baseUrl}${API_ENDPOINTS.JOB.LIST}`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async createJob(formData) {
    const payload = {
      title: formData.title,
      description: formData.description,
      employmentType: formData.type,
      location: formData.location,
      salary: buildSalaryString(formData.salaryMin, formData.salaryMax),
      skills: toSkillsArray(formData.skills),
      published: true,
    };

    const response = await httpClient.post(
      `${baseUrl}${API_ENDPOINTS.JOB.CREATE}`,
      payload
    );
    return response.data;
  },

  async getJobById(jobId) {
    const response = await httpClient.get(`${baseUrl}/jobs/${jobId}`);
    return response.data;
  },

  async updateJob(jobId, formData) {
    const payload = {
      title: formData.title,
      description: formData.description,
      employmentType: formData.type,
      location: formData.location,
      salary: buildSalaryString(formData.salaryMin, formData.salaryMax),
      skills: toSkillsArray(formData.skills),
      published: formData.published !== undefined ? formData.published : true,
      expiryDate: formData.expiryDate || null,
    };

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
