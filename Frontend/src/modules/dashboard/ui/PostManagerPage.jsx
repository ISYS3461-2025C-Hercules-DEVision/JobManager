import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobService } from "../services/jobService";

/**
 * PostManagerPage - Manage all job posts
 * Features: List view, status filters, edit/delete actions
 *
 * Job Post Statuses:
 * - Active: Published job accepting applications
 * - Closed: Job no longer accepting applications (expired or manually closed)
 * - Draft: Job created but not yet published
 *
 * Bulk Actions:
 * - Activate: Publish and make jobs active (accepting applications)
 * - Close: Stop accepting applications without deleting (keeps data for records)
 * - Delete: Permanently remove job posts from database
 */
function PostManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await jobService.listMyJobs();
        const today = new Date();

        const mapped = data.map((j) => {
          const expiry = j.expiryDate ? new Date(j.expiryDate) : null;
          let status = j.published ? "Active" : "Draft";
          if (j.published && expiry && expiry < today) status = "Closed";

          return {
            id: j.id,
            title: j.title,
            department: "-",
            location: j.location || "-",
            type: j.employmentType || "-",
            status,
            applicants: 0,
            views: 0,
            postedDate: j.postedDate || null,
            expiryDate: j.expiryDate || null,
          };
        });

        setJobPosts(mapped);
      } catch (error) {
        console.error("Failed to load job posts:", error);
        setJobPosts([]);
      }
    };

    load();
  }, []);

  const handleEdit = (jobId) => {
    navigate(`/dashboard/job-post?id=${jobId}`);
  };

  const handleView = async (jobId) => {
    setShowViewModal(true);
    setLoadingView(true);
    try {
      const job = await jobService.getJobById(jobId);
      setViewingJob(job);
    } catch (error) {
      console.error('Failed to load job details:', error);
      alert('Failed to load job details. Please try again.');
      setShowViewModal(false);
    } finally {
      setLoadingView(false);
    }
  };

  const confirmDelete = (jobId) => {
    setDeleteJobId(jobId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await jobService.deleteJob(deleteJobId);
      setJobPosts((prev) => prev.filter((job) => job.id !== deleteJobId));
      setShowDeleteDialog(false);
      setDeleteJobId(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = useMemo(
    () =>
      jobPosts.filter((post) => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return post.status === "Active";
        if (activeTab === "closed") return post.status === "Closed";
        if (activeTab === "draft") return post.status === "Draft";
        return true;
      }),
    [jobPosts, activeTab]
  );

  const toggleSelectPost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) return;

    const confirmMessage =
      action === "delete"
        ? `Are you sure you want to delete ${selectedPosts.length} job post(s)?`
        : action === "activate"
        ? `Activate ${selectedPosts.length} job post(s)?`
        : `Close ${selectedPosts.length} job post(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === "activate") {
        await jobService.bulkActivate(selectedPosts);
        // Update local state
        setJobPosts((prev) =>
          prev.map((job) =>
            selectedPosts.includes(job.id) ? { ...job, status: "Active" } : job
          )
        );
      } else if (action === "close") {
        await jobService.bulkClose(selectedPosts);
        // Update local state
        setJobPosts((prev) =>
          prev.map((job) =>
            selectedPosts.includes(job.id) ? { ...job, status: "Closed" } : job
          )
        );
      } else if (action === "delete") {
        await jobService.bulkDelete(selectedPosts);
        // Remove deleted jobs from local state
        setJobPosts((prev) =>
          prev.filter((job) => !selectedPosts.includes(job.id))
        );
      }

      setSelectedPosts([]);
      alert(
        `Successfully ${
          action === "activate"
            ? "activated"
            : action === "close"
            ? "closed"
            : "deleted"
        } ${selectedPosts.length} job post(s)`
      );
    } catch (error) {
      console.error(`Failed to ${action} jobs:`, error);
      alert(`Failed to ${action} job posts. Please try again.`);
    }
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
            { key: "all", label: "All Posts" },
            { key: "active", label: "Active" },
            { key: "closed", label: "Closed" },
            { key: "draft", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-black uppercase text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
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
            {selectedPosts.length} post{selectedPosts.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("close")}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
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
                    checked={
                      selectedPosts.length > 0 &&
                      selectedPosts.length === filteredPosts.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(filteredPosts.map((p) => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Job Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Applicants
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Posted
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b-2 border-gray-200 hover:bg-gray-50"
                >
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
                        post.status === "Active"
                          ? "bg-green-100 text-green-800 border-green-800"
                          : post.status === "Closed"
                          ? "bg-red-100 text-red-800 border-red-800"
                          : "bg-yellow-100 text-yellow-800 border-yellow-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">
                    {post.applicants}
                  </td>
                  <td className="px-6 py-4 text-center">{post.views}</td>
                  <td className="px-6 py-4 text-sm">
                    {post.postedDate || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleView(post.id)}
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(post.id)}
                        className="p-2 border-2 border-black hover:bg-primary hover:border-primary hover:text-white transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
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
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-black uppercase mb-2">
              No posts found
            </h3>
            <p className="text-gray-600">
              Create your first job post to get started
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-black uppercase mb-4">
              Delete Job Post?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job post? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-primary text-white font-bold uppercase border-2 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteJobId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-4 border-black p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase">Job Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingJob(null);
                }}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingView ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                  <p className="mt-4 font-bold">Loading job details...</p>
                </div>
              ) : viewingJob ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-3xl font-black uppercase mb-2">{viewingJob.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>📍 {viewingJob.location || 'Not specified'}</span>
                      <span>💼 {viewingJob.employmentType || 'Not specified'}</span>
                      {viewingJob.salary && <span>💰 {viewingJob.salary}</span>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`inline-block px-4 py-2 text-sm font-bold uppercase border-2 ${
                      viewingJob.published 
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-800'
                    }`}>
                      {viewingJob.published ? '✓ Published' : '📝 Draft'}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-lg font-black uppercase mb-3">Job Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewingJob.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Skills */}
                  {viewingJob.skills && viewingJob.skills.length > 0 && (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <h4 className="text-lg font-black uppercase mb-3">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingJob.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 border-2 border-black text-sm font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-lg font-black uppercase mb-3">Posting Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold">Posted Date:</span>
                        <p className="text-gray-700">{viewingJob.postedDate || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold">Expiry Date:</span>
                        <p className="text-gray-700">{viewingJob.expiryDate || 'No expiry set'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t-2 border-gray-200 pt-6 flex gap-4">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(viewingJob.id);
                      }}
                      className="flex-1 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                    >
                      Edit Job Post
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setViewingJob(null);
                      }}
                      className="px-6 py-3 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Failed to load job details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostManagerPage;
