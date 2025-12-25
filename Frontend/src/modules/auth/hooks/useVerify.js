import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useVerify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "code") setCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail({ email, code });
      setVerified(true);

      // On success navigate to login after short delay
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Email verified! You can now login." },
        });
      }, 1200);
    } catch (err) {
      console.error("Verify failed:", err);
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authService.resendVerification(email);
      setResendSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Resend failed:", err);
      setError(err.message || "Failed to resend verification code");
    } finally {
      setResending(false);
    }
  };

  return {
    email,
    code,
    loading,
    error,
    verified,
    resending,
    resendSuccess,
    handleChange,
    handleSubmit,
    handleResend,
    setEmail,
  };
};
