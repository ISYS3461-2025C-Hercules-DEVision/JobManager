import { useState, useEffect } from 'react';
import { useProfile } from '../../../state/ProfileContext';
import { useApp } from '../../../state/AppContext';

/**
 * SettingsPage - Company and account settings
 * Features: Profile settings, subscription management, preferences
 */
function SettingsPage() {
  const { profile, publicProfile, updateProfile, updatePublicProfile, loading } = useProfile();
  const { showSuccess, showError, showInfo } = useApp();

  const [activeSection, setActiveSection] = useState('company');
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
    streetAddress: '',
  });

  const [publicData, setPublicData] = useState({
    displayName: '',
    aboutUs: '',
    whoWeAreLookingFor: '',
    websiteUrl: '',
    industryDomain: '',
    logoUrl: '',
    bannerUrl: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newApplicants: true,
    jobExpiry: true,
    weeklyReport: false,
    marketingEmails: false,
  });

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setCompanyData({
        companyName: profile.companyName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        country: profile.country || '',
        city: profile.city || '',
        streetAddress: profile.streetAddress || '',
      });
    }
  }, [profile]);

  // Load public profile data when it changes
  useEffect(() => {
    if (publicProfile) {
      setPublicData({
        displayName: publicProfile.displayName || '',
        aboutUs: publicProfile.aboutUs || '',
        whoWeAreLookingFor: publicProfile.whoWeAreLookingFor || '',
        websiteUrl: publicProfile.websiteUrl || '',
        industryDomain: publicProfile.industryDomain || '',
        logoUrl: publicProfile.logoUrl || '',
        bannerUrl: publicProfile.bannerUrl || '',
      });
    }
  }, [publicProfile]);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublicProfileChange = (e) => {
    const { name, value } = e.target;
    setPublicData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();

    const result = await updateProfile(companyData);

    if (result.success) {
      showSuccess('Company profile updated successfully');
    } else {
      showError(result.error || 'Failed to update company profile');
    }
  };

  const handleSavePublicProfile = async (e) => {
    e.preventDefault();

    const result = await updatePublicProfile(publicData);

    if (result.success) {
      showSuccess('Public profile updated successfully');
    } else {
      showError(result.error || 'Failed to update public profile');
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    console.log('Changing password');
    // TODO: Implement password change API when backend is ready
    showInfo('Password change feature coming soon');
  };

  const sections = [
    { key: 'company', label: 'Company Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { key: 'account', label: 'Account Settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'subscription', label: 'Subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { key: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border-4 border-black">
            <nav className="p-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center px-4 py-3 font-bold uppercase text-sm text-left transition-colors ${
                    activeSection === section.key
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Company Profile Section */}
          {activeSection === 'company' && (
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase mb-6">Company Profile</h2>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={companyData.email}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={companyData.phoneNumber}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={companyData.country}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={companyData.city}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Street Address</label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={companyData.streetAddress}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Public Profile Section */}
              <div className="mt-8 pt-8 border-t-4 border-black">
                <h2 className="text-2xl font-black uppercase mb-6">Public Profile</h2>
                <form onSubmit={handleSavePublicProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Display Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={publicData.displayName}
                        onChange={handlePublicProfileChange}
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Industry Domain</label>
                      <input
                        type="text"
                        name="industryDomain"
                        value={publicData.industryDomain}
                        onChange={handlePublicProfileChange}
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Website URL</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={publicData.websiteUrl}
                      onChange={handlePublicProfileChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">About Us</label>
                    <textarea
                      name="aboutUs"
                      value={publicData.aboutUs}
                      onChange={handlePublicProfileChange}
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                    />
                    <p className="text-xs text-gray-600 mt-1">{publicData.aboutUs.length}/2000 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Who We Are Looking For</label>
                    <textarea
                      name="whoWeAreLookingFor"
                      value={publicData.whoWeAreLookingFor}
                      onChange={handlePublicProfileChange}
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                    />
                    <p className="text-xs text-gray-600 mt-1">{publicData.whoWeAreLookingFor.length}/1000 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Logo URL</label>
                      <input
                        type="url"
                        name="logoUrl"
                        value={publicData.logoUrl}
                        onChange={handlePublicProfileChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Banner URL</label>
                      <input
                        type="url"
                        name="bannerUrl"
                        value={publicData.bannerUrl}
                        onChange={handlePublicProfileChange}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Public Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Account Settings Section */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white border-4 border-black p-6">
                <h2 className="text-2xl font-black uppercase mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-white border-4 border-primary p-6">
                <h2 className="text-2xl font-black uppercase mb-4 text-primary">Danger Zone</h2>
                <p className="text-sm font-semibold mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Subscription Section */}
          {activeSection === 'subscription' && (
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase mb-6">Subscription Plan</h2>

              {/* Current Plan */}
              <div className="bg-primary text-white border-4 border-black p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-black uppercase">Premium Plan</h3>
                    <p className="font-bold">Active until Jan 15, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black">$99</p>
                    <p className="font-bold">/month</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited job posts
                  </p>
                  <p className="font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced applicant search
                  </p>
                  <p className="font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors">
                  Upgrade Plan
                </button>
                <button className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors">
                  View Billing History
                </button>
                <button className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors">
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div>
                      <p className="font-bold text-sm uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                        {key === 'newApplicants' && 'Get notified when new applicants apply to your jobs'}
                        {key === 'jobExpiry' && 'Receive reminders before job posts expire'}
                        {key === 'weeklyReport' && 'Get weekly summary of your job performance'}
                        {key === 'marketingEmails' && 'Receive tips and updates about our platform'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      className={`w-14 h-8 rounded-full border-2 border-black transition-colors ${
                        value ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white border-2 border-black rounded-full transition-transform ${
                          value ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button className="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors">
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

