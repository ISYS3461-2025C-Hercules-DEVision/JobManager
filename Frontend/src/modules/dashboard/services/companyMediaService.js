/**
 * Company Media Service
 * Handles all company media-related API calls (images and videos)
 */

import { companyHttpClient } from "../../../utils/companyHttpClient";
import { API_ENDPOINTS } from "../../../config/api";

/**
 * Upload a new media file (image or video)
 * @param {File} file - The file to upload
 * @param {string} mediaType - 'IMAGE' or 'VIDEO'
 * @param {string} title - Optional title
 * @param {string} description - Optional description
 * @returns {Promise<Object>} Upload response with media details
 */
export const uploadMedia = async (
  file,
  mediaType,
  title = "",
  description = ""
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediaType", mediaType);
  if (title) formData.append("title", title);
  if (description) formData.append("description", description);

  const response = await companyHttpClient.post(
    `${API_ENDPOINTS.COMPANY_MEDIA.UPLOAD}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Add media with a URL (without file upload)
 * @param {Object} mediaData - {url, mediaType, title, description}
 * @returns {Promise<Object>} Created media details
 */
export const addMediaWithUrl = async (mediaData) => {
  const response = await companyHttpClient.post(
    API_ENDPOINTS.COMPANY_MEDIA.BASE,
    mediaData
  );
  return response.data;
};

/**
 * Get all media for the authenticated company
 * @returns {Promise<Array>} List of all media items
 */
export const getAllMedia = async () => {
  const response = await companyHttpClient.get(
    API_ENDPOINTS.COMPANY_MEDIA.BASE
  );
  return response.data;
};

/**
 * Get only active/published media
 * @returns {Promise<Array>} List of active media items
 */
export const getActiveMedia = async () => {
  const response = await companyHttpClient.get(
    API_ENDPOINTS.COMPANY_MEDIA.ACTIVE
  );
  return response.data;
};

/**
 * Get media filtered by type
 * @param {string} mediaType - 'IMAGE' or 'VIDEO'
 * @returns {Promise<Array>} List of media items of specified type
 */
export const getMediaByType = async (mediaType) => {
  const response = await companyHttpClient.get(
    `${API_ENDPOINTS.COMPANY_MEDIA.BY_TYPE}/${mediaType}`
  );
  return response.data;
};

/**
 * Update media metadata
 * @param {string} mediaId - ID of the media to update
 * @param {Object} updateData - Object with title, description, isActive fields
 * @returns {Promise<Object>} Updated media details
 */
export const updateMedia = async (mediaId, updateData) => {
  const response = await companyHttpClient.put(
    `${API_ENDPOINTS.COMPANY_MEDIA.BASE}/${mediaId}`,
    updateData
  );
  return response.data;
};

/**
 * Delete a media item
 * @param {string} mediaId - ID of the media to delete
 * @returns {Promise<void>}
 */
export const deleteMedia = async (mediaId) => {
  await companyHttpClient.delete(
    `${API_ENDPOINTS.COMPANY_MEDIA.BASE}/${mediaId}`
  );
};

/**
 * Reorder media items
 * @param {Array<Object>} reorderData - Array of {mediaId, orderIndex} objects
 * @returns {Promise<Array>} Updated media list
 */
export const reorderMedia = async (reorderData) => {
  const response = await companyHttpClient.put(
    API_ENDPOINTS.COMPANY_MEDIA.REORDER,
    reorderData
  );
  return response.data;
};

/**
 * Get current media count
 * @returns {Promise<number>} Number of media items
 */
export const getMediaCount = async () => {
  const response = await companyHttpClient.get(
    API_ENDPOINTS.COMPANY_MEDIA.COUNT
  );
  return response.data;
};

export default {
  uploadMedia,
  getAllMedia,
  getActiveMedia,
  getMediaByType,
  updateMedia,
  deleteMedia,
  reorderMedia,
  getMediaCount,
};
