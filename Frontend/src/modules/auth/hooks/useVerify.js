import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useVerify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
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

  return {
    email,
    code,
    loading,
    error,
    verified,
    handleChange,
    handleSubmit,
    setEmail,
  };
};
