import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

function RegisterPage() {
  const {
    step,
    formData,
    loading,
    error,
    registrationSuccess,
    showPassword,
    showPasswordConfirmation,
    handleChange,
    handleSubmit,
    handleGoogleSignup,
    togglePasswordVisibility,
    togglePasswordConfirmationVisibility,
  } = useRegister();

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-10 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black text-center text-black mb-8  ">
          Get started now!
        </h1>

        {error && (
          <div className="mb-4 p-4 border-4 border-primary bg-primary/10 text-black font-bold">
            {error}
          </div>
        )}

        {registrationSuccess && (
          <div className="mb-4 p-4 border-4 border-green-500 bg-green-100 text-black font-bold">
            ✅ Registration successful! Please check your email to verify your
            account. Redirecting to verification page...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <input
                type="text"
                name="companyName"
                placeholder="COMPANY NAME"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="COMPANY EMAIL"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="PASSWORD"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  name="passwordConfirmation"
                  placeholder="CONFIRM PASSWORD"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordConfirmationVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {showPasswordConfirmation ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="PHONE NUMBER"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="country"
                placeholder="COUNTRY"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="city"
                placeholder="CITY"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="STREET ADDRESS"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold   placeholder:text-dark"
                required
                disabled={loading}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 border-4 border-black   hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : step < 3 ? "Create Profile" : "Complete"}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>

        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <div
            className={`w-14 h-14 flex items-center justify-center border-4 border-black font-black text-xl ${
              step === 1 ? "bg-primary text-white" : "bg-white text-black"
            }`}
          >
            1
          </div>
          <div
            className={`w-14 h-14 flex items-center justify-center border-4 border-black font-black text-xl ${
              step === 2 ? "bg-primary text-white" : "bg-white text-black"
            }`}
          >
            2
          </div>
          <div
            className={`w-14 h-14 flex items-center justify-center border-4 border-black font-black text-xl ${
              step === 3 ? "bg-primary text-white" : "bg-white text-black"
            }`}
          >
            3
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-4 border-black"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-black font-black  ">OR</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-4 border-black hover:bg-black hover:text-white text-black font-bold py-4   transition-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <p className="text-center mt-6 text-black font-bold   text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-black underline underline-offset-4 decoration-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
