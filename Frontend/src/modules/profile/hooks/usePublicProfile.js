import { useState } from "react";
import { profileService } from "../services/profileService";

/**
 * Custom hook for managing public profile creation
 * Handles form state, validation, and submission for first-time users
 */
export const usePublicProfile = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    aboutUs: "",
    whoWeAreLookingFor: "",
    websiteUrl: "",
    industryDomain: "",
    logoUrl: "",
    bannerUrl: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        if (name === 'companyLogo') {
          setLogoPreview(previewUrl);
          // In a real implementation, you would upload the file to a storage service
          // and set the URL in formData. For now, we'll use the preview URL
          setFormData({
            ...formData,
            logoUrl: previewUrl,
          });
        } else if (name === 'companyBanner') {
          setBannerPreview(previewUrl);
          setFormData({
            ...formData,
            bannerUrl: previewUrl,
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend API to create public profile
      await profileService.createPublicProfile({
        companyName: formData.companyName,
        logoUrl: formData.logoUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
      });

      // Mark profile as completed in localStorage
      localStorage.setItem("profileCompleted", "true");
      
      setSuccess(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Failed to create profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    // Allow users to close without completing, but don't mark as complete
    setSuccess(false);
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: "" });
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const removeBanner = () => {
    setFormData({ ...formData, bannerUrl: "" });
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
  };

  return {
    formData,
    loading,
    error,
    success,
    logoPreview,
    bannerPreview,
    handleChange,
    handleSubmit,
    closeModal,
    removeLogo,
    removeBanner,
  };
};
