import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    phoneNumber: "",
    country: "",
    city: "",
    streetAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const buildRegisterData = () => {
    let phone = (formData.phoneNumber || "").trim();

    // Normalize free-text country input to a country code when possible
    const mapCountryToCode = (val) => {
      const v = (val || "").trim().toUpperCase();
      if (!v) return "";
      if (["AU", "AUSTRALIA"].includes(v)) return "AU";
      if (["VN", "VIETNAM", "VNM"].includes(v)) return "VN";
      if (
        ["US", "UNITED STATES", "UNITED STATES OF AMERICA", "USA"].includes(v)
      )
        return "US";
      if (["UK", "UNITED KINGDOM", "GREAT BRITAIN", "GB", "GBR"].includes(v))
        return "UK";
      return val.trim();
    };

    const countryCode = mapCountryToCode(formData.country);

    // Format Vietnam numbers to +84XXXXXXXXX
    if (countryCode === "VN" && phone) {
      if (phone.startsWith("0")) {
        phone = "+84" + phone.substring(1);
      } else if (!phone.startsWith("+84")) {
        phone = "+84" + phone;
      }
    }

    return {
      companyName: formData.companyName,
      email: formData.email,
      password: formData.password,
      phoneNumber: phone,
      country: countryCode || formData.country,
      city: formData.city,
      streetAddress: formData.streetAddress,
      address: formData.streetAddress,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (formData.password !== formData.passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    // If user clicks "Create Profile" on step 1, register immediately and go to verify page
    if (step === 1) {
      setLoading(true);
      setError(null);

      try {
        const payload = buildRegisterData();

        // Basic client-side validation for VN phone format
        if (
          payload.country === "VN" &&
          payload.phoneNumber &&
          !/^\+84\d{8,10}$/.test(payload.phoneNumber)
        ) {
          setError(
            "Phone number must start with +84 and contain 8-10 digits after the prefix"
          );
          setLoading(false);
          return;
        }

        await authService.register({
          companyName: payload.companyName,
          email: payload.email,
          password: payload.password,
          phoneNumber: payload.phoneNumber,
          country: payload.country,
          city: payload.city,
          streetAddress: payload.streetAddress,
          address: payload.address,
        });

        console.log("✅ Registration successful - Please verify your email");
        setRegistrationSuccess(true);

        setTimeout(() => {
          navigate("/verify-email", {
            state: {
              email: formData.email,
            },
          });
        }, 700);
      } catch (err) {
        console.error("❌ Registration failed:", err);
        setError(err.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (step < 3) {
      setStep(step + 1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = buildRegisterData();

      // Basic client-side validation for VN phone format
      if (
        payload.country === "VN" &&
        payload.phoneNumber &&
        !/^\+84\d{8,10}$/.test(payload.phoneNumber)
      ) {
        setError(
          "Phone number must start with +84 and contain 8-10 digits after the prefix"
        );
        setLoading(false);
        return;
      }

      // Call backend API
      await authService.register({
        companyName: payload.companyName,
        email: payload.email,
        password: payload.password,
        phoneNumber: payload.phoneNumber,
        country: payload.country,
        city: payload.city,
        streetAddress: payload.streetAddress,
        address: payload.address,
      });

      console.log("✅ Registration successful - Please verify your email");

      // Show success message and redirect to verification page or login
      setRegistrationSuccess(true);

      // Navigate to verification page with email prefilled
      setTimeout(() => {
        navigate("/verify-email", {
          state: {
            email: formData.email,
          },
        });
      }, 700);
    } catch (err) {
      console.error("❌ Registration failed:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    formData,
    loading,
    error,
    registrationSuccess,
    handleChange,
    handleSubmit,
  };
};
