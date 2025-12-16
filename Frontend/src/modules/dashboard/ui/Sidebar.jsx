import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * Sidebar Component - Navigation sidebar for Job Manager Dashboard
 * Features:
 * - Navigation menu items
 * - Company profile section with subscription status
 * - Logout functionality
 */
function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock company data - replace with actual data from context/state management
  const companyData = {
    name: 'Tech Corp',
    avatar: null,
    subscriptionPlan: 'Premium',
    subscriptionStatus: 'Active',
  };

  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Navigate to login page
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Find Applicants',
      path: '/dashboard/find-applicants',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: 'Post Manager',
      path: '/dashboard/post-manager',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Job Post',
      path: '/dashboard/job-post',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`bg-dark text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header */}
      <div className="p-6 border-b-2 border-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-black uppercase tracking-tight">
              DEVision.Manager
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg font-bold uppercase text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white hover:bg-white/10'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : ''}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Company Profile Section */}
      <div className="border-t-2 border-white p-4">
        {!isCollapsed ? (
          <>
            {/* Company Info */}
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                {/* Company Avatar */}
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center font-black text-lg">
                  {companyData.avatar ? (
                    <img src={companyData.avatar} alt={companyData.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    companyData.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{companyData.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-semibold text-gray-300">
                      {companyData.subscriptionPlan}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      companyData.subscriptionStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Status:</span>
                  <span className={`font-bold uppercase ${
                    companyData.subscriptionStatus === 'Active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {companyData.subscriptionStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-white text-dark font-bold uppercase text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-white text-dark font-bold rounded-lg hover:bg-gray-200 transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

