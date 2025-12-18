import { useState } from "react";

/**
 * Custom hook for managing public profile creation
 * Handles form state, validation, and submission for first-time users
 */
export const usePublicProfile = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    aboutUs: "",
    whoWeAreLookingFor: "",
    websiteURL: "",
    industryDomain: "",
    country: "",
    city: "",
    companyLogo: null,
    companyBanner: null,
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
        setFormData({
          ...formData,
          [name]: file,
        });
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        if (name === 'companyLogo') {
          setLogoPreview(previewUrl);
        } else if (name === 'companyBanner') {
          setBannerPreview(previewUrl);
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
      // TODO: Replace with actual API call to save public profile
      // await profileService.createPublicProfile(formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mark profile as completed in localStorage
      localStorage.setItem("profileCompleted", "true");
      
      setSuccess(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create profile";
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
    setFormData({ ...formData, companyLogo: null });
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const removeBanner = () => {
    setFormData({ ...formData, companyBanner: null });
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
