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
    websiteURL: "",
    industryDomain: "",
    country: "",
    city: "",
    logoUrl: "",
    bannerUrl: "",
  });
  const [logoFile, setLogoFile] = useState(null); // Store actual file
  const [bannerFile, setBannerFile] = useState(null); // Store actual file
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        if (name === "companyLogo") {
          setLogoFile(file); // Store the actual file
          setLogoPreview(previewUrl);
        } else if (name === "companyBanner") {
          setBannerFile(file); // Store the actual file
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
      // Step 1: Create public profile with text data only
      await profileService.createPublicProfile({
        companyName: formData.companyName,
        aboutUs: formData.aboutUs,
        whoWeAreLookingFor: formData.whoWeAreLookingFor,
        websiteURL: formData.websiteURL,
        industryDomain: formData.industryDomain,
        country: formData.country,
        city: formData.city,
      });

      // Step 2: Upload logo if provided
      if (logoFile) {
        await profileService.uploadProfileLogo(logoFile);
      }

      // Step 3: Upload banner if provided
      if (bannerFile) {
        await profileService.uploadProfileBanner(bannerFile);
      }

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
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
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
