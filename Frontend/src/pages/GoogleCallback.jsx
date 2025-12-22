import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../modules/auth/services/authService";

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google authentication was cancelled or failed");
        setTimeout(() => navigate("/register"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/register"), 3000);
        return;
      }

      try {
        // Send code to backend
        await authService.loginWithGoogle(code);
        // Redirect to dashboard on success
        navigate("/dashboard");
      } catch (err) {
        console.error("Google auth error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => navigate("/register"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-10 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-black mb-4 uppercase">
              Authentication Failed
            </h1>
            <p className="text-black font-bold mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              Redirecting to registration...
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <h1 className="text-2xl font-black text-black mb-4 uppercase">
              Authenticating with Google
            </h1>
            <p className="text-black font-bold">Please wait...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;
