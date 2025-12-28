import { usePublicProfile } from "../hooks/usePublicProfile";

/**
 * CreatePublicProfile - Modal form for first-time users to create their public profile
 * Displays with the same UI as registration form
 * Shows automatically when user first accesses dashboard
 */
function CreatePublicProfile({ onClose, onSuccess }) {
  const {
    formData,
    loading,
    error,
    success,
    logoPreview,
    bannerPreview,
    handleChange,
    handleSubmit,
    removeLogo,
    removeBanner,
  } = usePublicProfile();

  // Auto close on success
  if (success) {
    setTimeout(() => {
      onSuccess?.();
    }, 1500);
  }

  const handleFormSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black p-10 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">
              Create Your Public Profile
            </h1>
            <p className="text-gray-600 font-semibold mt-2">
              Complete your profile to get started!
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-primary font-black text-2xl leading-none"
            type="button"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 border-4 border-primary bg-primary/10 text-black font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 border-4 border-green-500 bg-green-100 text-black font-bold">
            ✅ Profile created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              Company Logo
            </h2>
            <div className="flex items-center gap-6">
              {logoPreview ? (
                <div className="relative w-32 h-32 border-4 border-black">
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-4 border-dashed border-black flex items-center justify-center bg-gray-50">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    name="companyLogo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <span className="bg-white text-black font-bold py-3 px-6 border-4 border-black uppercase hover:bg-black hover:text-white transition-colors inline-block">
                    Upload Logo
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Recommended: Square image, at least 200x200px</p>
              </div>
            </div>
          </div>

          {/* Company Banner */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              Company Banner
            </h2>
            <div className="space-y-4">
              {bannerPreview ? (
                <div className="relative w-full h-48 border-4 border-black">
                  <img
                    src={bannerPreview}
                    alt="Company Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 border-4 border-dashed border-black flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 font-bold uppercase text-sm">Banner Image</p>
                  </div>
                </div>
              )}
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  name="companyBanner"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  disabled={loading}
                />
                <span className="bg-white text-black font-bold py-3 px-6 border-4 border-black uppercase hover:bg-black hover:text-white transition-colors inline-block">
                  Upload Banner
                </span>
              </label>
              <p className="text-xs text-gray-600 font-semibold">Recommended: 1200x400px or similar aspect ratio</p>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              Company Information
            </h2>
            
            <input
              type="text"
              name="companyName"
              placeholder="COMPANY NAME"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
              required
              disabled={loading}
            />

            <input
              type="url"
              name="websiteURL"
              placeholder="WEBSITE URL"
              value={formData.websiteURL}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
              required
              disabled={loading}
            />

            <select
              name="industryDomain"
              value={formData.industryDomain}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase text-dark"
              required
              disabled={loading}
            >
              <option value="">SELECT INDUSTRY DOMAIN</option>
              <option value="technology">TECHNOLOGY</option>
              <option value="finance">FINANCE</option>
              <option value="healthcare">HEALTHCARE</option>
              <option value="education">EDUCATION</option>
              <option value="retail">RETAIL</option>
              <option value="manufacturing">MANUFACTURING</option>
              <option value="consulting">CONSULTING</option>
              <option value="media">MEDIA & ENTERTAINMENT</option>
              <option value="other">OTHER</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              Location
            </h2>

            <input
              type="text"
              name="country"
              placeholder="COUNTRY"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
              required
              disabled={loading}
            />

            <input
              type="text"
              name="city"
              placeholder="CITY"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark"
              required
              disabled={loading}
            />
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              About Us
            </h2>

            <textarea
              name="aboutUs"
              placeholder="TELL US ABOUT YOUR COMPANY..."
              value={formData.aboutUs}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark resize-none"
              required
              disabled={loading}
            />
          </div>

          {/* Who We Are Looking For */}
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-gray-700 border-b-4 border-black pb-2">
              Who We Are Looking For
            </h2>

            <textarea
              name="whoWeAreLookingFor"
              placeholder="DESCRIBE THE IDEAL CANDIDATES YOU'RE SEEKING..."
              value={formData.whoWeAreLookingFor}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold uppercase placeholder:text-dark resize-none"
              required
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 border-4 border-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING PROFILE..." : "CREATE PROFILE"}
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

          {/* Skip Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 border-4 border-black uppercase hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SKIP FOR NOW
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePublicProfile;