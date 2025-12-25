import { useProfile } from '../hooks/useProfile';
import PropTypes from 'prop-types';

/**
 * ProfileDetail Component
 * Displays company profile information in a read-only format
 */
function ProfileDetail({ onEdit }) {
  const { companyProfile, publicProfile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-4 border-red-500 p-6">
        <h3 className="text-lg font-bold uppercase text-red-800 mb-2">Error Loading Profile</h3>
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="bg-gray-50 border-4 border-gray-300 p-6">
        <p className="text-gray-600 font-semibold">No profile data available</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Company Basic Information */}
      <div className="bg-white border-4 border-black p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase">Company Information</h2>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold uppercase text-sm border-2 border-black transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Company Name
            </label>
            <p className="text-lg font-bold">{companyProfile.companyName || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Email
            </label>
            <p className="text-lg font-bold">{companyProfile.email || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Phone Number
            </label>
            <p className="text-lg font-bold">{companyProfile.phoneNumber || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Country
            </label>
            <p className="text-lg font-bold">{companyProfile.country || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              City
            </label>
            <p className="text-lg font-bold">{companyProfile.city || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Street Address
            </label>
            <p className="text-lg font-bold">{companyProfile.streetAddress || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Account Status
            </label>
            <span
              className={`inline-block px-3 py-1 font-bold uppercase text-sm ${
                companyProfile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {companyProfile.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Email Verified
            </label>
            <span
              className={`inline-block px-3 py-1 font-bold uppercase text-sm ${
                companyProfile.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {companyProfile.isEmailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
              Subscription Plan
            </label>
            <span
              className={`inline-block px-3 py-1 font-bold uppercase text-sm ${
                companyProfile.isPremium ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {companyProfile.isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 font-semibold">
          <p>Account created: {formatDate(companyProfile.createdAt)}</p>
          <p>Last updated: {formatDate(companyProfile.updatedAt)}</p>
        </div>
      </div>

      {/* Public Profile Information */}
      {publicProfile && (
        <div className="bg-white border-4 border-black p-6">
          <h2 className="text-2xl font-black uppercase mb-6">Public Profile</h2>

          <div className="space-y-6">
            {/* Logo and Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase text-gray-600 mb-2">
                  Company Logo
                </label>
                {publicProfile.logoUrl ? (
                  <img
                    src={publicProfile.logoUrl}
                    alt="Company Logo"
                    className="w-32 h-32 object-cover border-2 border-black"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 border-2 border-black flex items-center justify-center">
                    <span className="text-gray-400 font-bold">No Logo</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-600 mb-2">
                  Company Banner
                </label>
                {publicProfile.bannerUrl ? (
                  <img
                    src={publicProfile.bannerUrl}
                    alt="Company Banner"
                    className="w-full h-32 object-cover border-2 border-black"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 border-2 border-black flex items-center justify-center">
                    <span className="text-gray-400 font-bold">No Banner</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase text-gray-600 mb-2">
                Display Name
              </label>
              <p className="text-lg font-bold">{publicProfile.displayName || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase text-gray-600 mb-2">
                About Us
              </label>
              <p className="font-semibold whitespace-pre-wrap">
                {publicProfile.aboutUs || 'No description provided'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase text-gray-600 mb-2">
                Who We Are Looking For
              </label>
              <p className="font-semibold whitespace-pre-wrap">
                {publicProfile.whoWeAreLookingFor || 'No information provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
                  Website
                </label>
                {publicProfile.websiteUrl ? (
                  <a
                    href={publicProfile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    {publicProfile.websiteUrl}
                  </a>
                ) : (
                  <p className="font-semibold">N/A</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-600 mb-1">
                  Industry Domain
                </label>
                <p className="font-bold">{publicProfile.industryDomain || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!publicProfile && companyProfile.hasPublicProfile === false && (
        <div className="bg-yellow-50 border-4 border-yellow-500 p-6">
          <h3 className="text-lg font-bold uppercase text-yellow-800 mb-2">
            Public Profile Not Set Up
          </h3>
          <p className="text-yellow-700 font-semibold mb-4">
            Complete your public profile to make your company visible to job seekers.
          </p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold uppercase text-sm border-2 border-black transition-colors"
            >
              Set Up Public Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ProfileDetail.propTypes = {
  onEdit: PropTypes.func,
};

export default ProfileDetail;

