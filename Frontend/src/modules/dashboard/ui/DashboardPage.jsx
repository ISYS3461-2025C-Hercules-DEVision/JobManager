import { useState, useEffect } from 'react';
import CreatePublicProfile from '../../profile/ui/CreatePublicProfile';

/**
 * DashboardPage - Main dashboard overview page
 * Shows key metrics, recent activities, and quick actions
 */
function DashboardPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    // Check if user has completed their profile
    const profileCompleted = localStorage.getItem('profileCompleted');
    if (!profileCompleted) {
      setShowProfileModal(true);
    }
  }, []);

  const handleProfileSuccess = () => {
    setShowProfileModal(false);
  };

  const handleProfileClose = () => {
    setShowProfileModal(false);
  };

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Active Jobs', value: 12, change: '+2 this week', trend: 'up' },
    { label: 'Total Applicants', value: 234, change: '+18 this week', trend: 'up' },
    { label: 'Pending Reviews', value: 45, change: '8 urgent', trend: 'neutral' },
    { label: 'Profile Views', value: 1284, change: '+124 this week', trend: 'up' },
  ];

  const recentJobs = [
    { id: 1, title: 'Senior Frontend Developer', applicants: 23, status: 'Active', postedDate: '2025-12-10' },
    { id: 2, title: 'Backend Engineer', applicants: 34, status: 'Active', postedDate: '2025-12-08' },
    { id: 3, title: 'DevOps Specialist', applicants: 12, status: 'Closed', postedDate: '2025-12-05' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your job posts.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border-4 border-black p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
              {stat.trend === 'up' && (
                <div className="bg-green-100 p-2 rounded">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white border-4 border-black">
        <div className="border-b-4 border-black p-6">
          <h2 className="text-2xl font-black uppercase">Recent Job Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-4 border-black">
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Applicants</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Posted Date</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{job.title}</td>
                  <td className="px-6 py-4">{job.applicants}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase ${
                      job.status === 'Active' 
                        ? 'bg-green-100 text-green-800 border-2 border-green-800' 
                        : 'bg-gray-100 text-gray-800 border-2 border-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{job.postedDate}</td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 text-xs font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-primary hover:bg-primary-hover text-white font-black uppercase p-6 border-4 border-black transition-colors">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </button>
        <button className="bg-white hover:bg-gray-100 text-black font-black uppercase p-6 border-4 border-black transition-colors">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Applicants
        </button>
        <button className="bg-white hover:bg-gray-100 text-black font-black uppercase p-6 border-4 border-black transition-colors">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Reports
        </button>
      </div>

      {/* Profile Creation Modal */}
      {showProfileModal && (
        <CreatePublicProfile
          onClose={handleProfileClose}
          onSuccess={handleProfileSuccess}
        />
      )}
    </div>
  );
}

export default DashboardPage;

