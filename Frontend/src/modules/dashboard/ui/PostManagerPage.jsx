import { useState } from 'react';

/**
 * PostManagerPage - Manage all job posts
 * Features: List view, status filters, edit/delete actions
 */
function PostManagerPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);

  // Mock job posts data
  const jobPosts = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applicants: 23,
      views: 456,
      postedDate: '2025-12-10',
      expiryDate: '2026-01-10',
    },
    {
      id: 2,
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 34,
      views: 678,
      postedDate: '2025-12-08',
      expiryDate: '2026-01-08',
    },
    {
      id: 3,
      title: 'DevOps Specialist',
      department: 'Operations',
      location: 'San Francisco, CA',
      type: 'Contract',
      status: 'Closed',
      applicants: 12,
      views: 234,
      postedDate: '2025-12-05',
      expiryDate: '2025-12-20',
    },
    {
      id: 4,
      title: 'UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      status: 'Draft',
      applicants: 0,
      views: 0,
      postedDate: null,
      expiryDate: null,
    },
  ];

  const filteredPosts = jobPosts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return post.status === 'Active';
    if (activeTab === 'closed') return post.status === 'Closed';
    if (activeTab === 'draft') return post.status === 'Draft';
    return true;
  });

  const toggleSelectPost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on posts:`, selectedPosts);
    // Implement bulk actions here
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Post Manager</h1>
        <p className="text-gray-600">Manage and track all your job postings</p>
      </div>

      {/* Tabs */}
      <div className="border-b-4 border-black mb-6">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Posts' },
            { key: 'active', label: 'Active' },
            { key: 'closed', label: 'Closed' },
            { key: 'draft', label: 'Drafts' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-black uppercase text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="bg-primary text-white border-4 border-black p-4 mb-6 flex items-center justify-between">
          <span className="font-bold">
            {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('close')}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white border-4 border-black">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-4 border-black bg-gray-100">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(filteredPosts.map((p) => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Department</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Type</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Applicants</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Views</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Posted</th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => toggleSelectPost(post.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{post.title}</div>
                    <div className="text-sm text-gray-600">{post.location}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{post.department}</td>
                  <td className="px-6 py-4 text-sm">{post.type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                        post.status === 'Active'
                          ? 'bg-green-100 text-green-800 border-green-800'
                          : post.status === 'Closed'
                          ? 'bg-red-100 text-red-800 border-red-800'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">{post.applicants}</td>
                  <td className="px-6 py-4 text-center">{post.views}</td>
                  <td className="px-6 py-4 text-sm">{post.postedDate || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 border-2 border-black hover:bg-primary hover:border-primary hover:text-white transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-black uppercase mb-2">No posts found</h3>
            <p className="text-gray-600">Create your first job post to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostManagerPage;

