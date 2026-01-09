import { useProfile } from "../../../state/ProfileContext";

/**
 * ProfileView - Public profile view component
 * Displays the company's public profile in a beautiful, professional layout
 * Accessed from the user account section in the sidebar
 */
function ProfileView() {
  const { publicProfile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border-4 border-red-500 p-8 max-w-md">
          <h3 className="text-xl font-black uppercase text-red-800 mb-3">
            Error Loading Profile
          </h3>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!publicProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border-4 border-yellow-500 p-8 max-w-md text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-black uppercase text-yellow-800 mb-3">
            Public Profile Not Available
          </h3>
          <p className="text-yellow-700 font-semibold mb-4">
            Your public profile hasn't been set up yet.
          </p>
          <p className="text-sm text-yellow-600 font-semibold">
            Please complete your profile setup in Settings to view your public
            profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Banner Section */}
      <div className="relative">
        {publicProfile.bannerUrl ? (
          <div className="w-full h-64 md:h-80 bg-dark overflow-hidden">
            <img
              src={publicProfile.bannerUrl}
              alt={`${publicProfile.displayName} Banner`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-80 bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="w-24 h-24 mx-auto mb-4 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
        )}

        {/* Company Logo - Overlapping Banner */}
        <div className="absolute -bottom-16 left-8 md:left-16">
          {publicProfile.logoUrl ? (
            <div className="w-32 h-32 md:w-40 md:h-40 border-6 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <img
                src={publicProfile.logoUrl}
                alt={`${publicProfile.displayName} Logo`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 border-6 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary flex items-center justify-center">
              <span className="text-white text-4xl md:text-5xl font-black">
                {publicProfile.displayName?.charAt(0).toUpperCase() || "C"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-12">
        {/* Company Name and Basic Info */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-dark uppercase mb-3">
            {publicProfile.displayName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-600 font-semibold">
            {publicProfile.industryDomain && (
              <div className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:border-primary hover:text-primary transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="uppercase font-bold">
                  {publicProfile.industryDomain}
                </span>
              </div>
            )}

            {publicProfile.city && publicProfile.country && (
              <div className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:border-primary hover:text-primary transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-bold">
                  {publicProfile.city}, {publicProfile.country}
                </span>
              </div>
            )}

            {publicProfile.websiteUrl && (
              <div className="flex items-center gap-2 bg-primary border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <a
                  href={publicProfile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-black uppercase text-sm"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* About Us Section */}
          {publicProfile.aboutUs && (
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] hover:border-primary transition-all duration-300 group">
              <h2 className="text-2xl font-black uppercase text-dark mb-4 border-b-4 border-black pb-2 group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                About Us
              </h2>
              <p className="text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap">
                {publicProfile.aboutUs}
              </p>
            </div>
          )}

          {/* Who We Are Looking For Section */}
          {publicProfile.whoWeAreLookingFor && (
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] hover:border-primary transition-all duration-300 group">
              <h2 className="text-2xl font-black uppercase text-dark mb-4 border-b-4 border-black pb-2 group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                Who We Are Looking For
              </h2>
              <p className="text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap">
                {publicProfile.whoWeAreLookingFor}
              </p>
            </div>
          )}

          {/* Company Details */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] hover:border-primary transition-all duration-300 group">
            <h2 className="text-2xl font-black uppercase text-dark mb-6 border-b-4 border-black pb-2 group-hover:border-primary group-hover:text-primary transition-colors duration-300">
              Company Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicProfile.displayName && (
                <div>
                  <label className="block text-sm font-black uppercase text-gray-600 mb-2">
                    Company Name
                  </label>
                  <p className="text-lg font-bold text-dark">
                    {publicProfile.displayName}
                  </p>
                </div>
              )}

              {publicProfile.industryDomain && (
                <div>
                  <label className="block text-sm font-black uppercase text-gray-600 mb-2">
                    Industry
                  </label>
                  <p className="text-lg font-bold text-dark uppercase">
                    {publicProfile.industryDomain}
                  </p>
                </div>
              )}

              {publicProfile.city && (
                <div>
                  <label className="block text-sm font-black uppercase text-gray-600 mb-2">
                    City
                  </label>
                  <p className="text-lg font-bold text-dark">
                    {publicProfile.city}
                  </p>
                </div>
              )}

              {publicProfile.country && (
                <div>
                  <label className="block text-sm font-black uppercase text-gray-600 mb-2">
                    Country
                  </label>
                  <p className="text-lg font-bold text-dark">
                    {publicProfile.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white font-black py-4 px-8 border-4 border-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-hover"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
