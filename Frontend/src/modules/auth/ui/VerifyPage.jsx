import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useVerify } from "../hooks";

function VerifyPage() {
  const location = useLocation();
  const { email: initialEmail } = location.state || {};
  const {
    email,
    code,
    loading,
    error,
    verified,
    handleChange,
    handleSubmit,
    setEmail,
  } = useVerify();

  // If user was redirected from register with email, prefill
  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-10 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black text-center text-black mb-8 uppercase">
          Verify your email
        </h1>

        {error && (
          <div className="mb-4 p-4 border-4 border-primary bg-primary/10 text-black font-bold">
            {error}
          </div>
        )}

        {verified && (
          <div className="mb-4 p-4 border-4 border-green-500 bg-green-100 text-black font-bold">
            ✅ Email verified! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={email}
            onChange={handleChange}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
            required
            disabled={loading || verified}
          />

          <input
            type="text"
            name="code"
            placeholder="VERIFICATION CODE"
            value={code}
            onChange={handleChange}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
            required
            disabled={loading || verified}
          />

          <button
            type="submit"
            disabled={loading || verified}
            className="w-full bg-primary text-white font-black py-4 border-4 border-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-center mt-6 text-black font-bold uppercase text-sm">
          Didn't get a code? Check your spam folder or resend from the login
          page.
        </p>
      </div>
    </div>
  );
}

export default VerifyPage;
