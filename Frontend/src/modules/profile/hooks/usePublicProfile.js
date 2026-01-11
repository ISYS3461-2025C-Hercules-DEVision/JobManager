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
      // Step 1: Check if public profile already exists
      try {
        const existingProfile = await profileService.getPublicProfile();
        if (existingProfile) {
          // Profile already exists - reject the creation attempt
          setError("Public profile already exists. Please update from Settings instead.");
          setLoading(false);
          return { success: false, error: "Public profile already exists" };
        }
      } catch (err) {
        // Profile doesn't exist (404 error), continue with creation
      }

      // Step 2: Create new public profile with text data only
      await profileService.createPublicProfile({
        companyName: formData.companyName,
        aboutUs: formData.aboutUs,
        whoWeAreLookingFor: formData.whoWeAreLookingFor,
        websiteURL: formData.websiteURL,
        industryDomain: formData.industryDomain,
        country: formData.country,
        city: formData.city,
      });

      // Step 3: Upload logo if provided
      if (logoFile) {
        try {
          const logoResult = await profileService.uploadProfileLogo(logoFile);
          console.log("Logo uploaded successfully:", logoResult);
        } catch (logoError) {
          console.error("Logo upload failed:", logoError);
          // Don't fail the entire submission if logo upload fails
          // User can upload logo later from settings
        }
      }

      // Step 4: Upload banner if provided
      if (bannerFile) {
        try {
          const bannerResult = await profileService.uploadProfileBanner(bannerFile);
          console.log("Banner uploaded successfully:", bannerResult);
        } catch (bannerError) {
          console.error("Banner upload failed:", bannerError);
          // Don't fail the entire submission if banner upload fails
          // User can upload banner later from settings
        }
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
