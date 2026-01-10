import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePublicProfile from "../../profile/ui/CreatePublicProfile";
import { profileService } from "../../profile/services/profileService";
import { useProfile } from "../../../state/ProfileContext";
import { jobService } from "../services/jobService";

/**
 * DashboardPage - Main dashboard overview page
 * Shows key metrics, recent activities, and quick actions
 */
function DashboardPage() {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const { refreshProfile } = useProfile();
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  useEffect(() => {
    // Check if user has completed their profile from backend
    const checkProfileStatus = async () => {
      // Retry logic for Google OAuth users (company might not be created yet via Kafka)
      const maxRetries = 5;
      const delays = [500, 1000, 1500, 2000, 2500]; // Progressive delays
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const status = await profileService.checkProfileStatus();
          console.log("🔍 Profile Status Check:", status); // DEBUG
          console.log("  - hasPublicProfile:", status.hasPublicProfile); // DEBUG
          console.log("  - Should show modal:", !status.hasPublicProfile); // DEBUG

          if (!status.hasPublicProfile) {
            console.log("✅ Showing modal - user has no public profile"); // DEBUG
            setShowProfileModal(true);
          } else {
            console.log("❌ Not showing modal - user already has profile"); // DEBUG
          }
          setLoading(false);
          return; // Success, exit retry loop
        } catch (error) {
          console.error(`Profile status check attempt ${attempt + 1}/${maxRetries} failed:`, error);
          
          // If not the last attempt, wait before retry
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delays[attempt]));
            console.log(`Retrying in ${delays[attempt]}ms...`);
          } else {
            // Final attempt failed, don't show modal to avoid annoying user
            console.error("All profile status check attempts failed");
            setLoading(false);
          }
        }
      }
    };

    checkProfileStatus();
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await jobService.listMyJobs();
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      }
    };

    loadJobs();
  }, []);

  const handleProfileSuccess = () => {
    setShowProfileModal(false);
    refreshProfile(); // Ensure profile state is updated after creation
  };

  const handleProfileClose = () => {
    setShowProfileModal(false);
  };

  const handleView = async (jobId) => {
    setShowViewModal(true);
    setLoadingView(true);
    try {
      const job = await jobService.getJobById(jobId);
      setViewingJob(job);
    } catch (error) {
      console.error("Failed to load job details:", error);
      alert("Failed to load job details. Please try again.");
      setShowViewModal(false);
    } finally {
      setLoadingView(false);
    }
  };

  const activeJobsCount = jobs.filter((j) => j?.published).length;

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobsCount,
      change: "",
      trend: "neutral",
    },
    { label: "Total Applicants", value: 0, change: "", trend: "neutral" },
    { label: "Pending Reviews", value: 0, change: "", trend: "neutral" },
    { label: "Profile Views", value: 0, change: "", trend: "neutral" },
  ];

  const recentJobs = jobs.slice(0, 5).map((job) => ({
    id: job.id,
    title: job.title,
    applicants: 0,
    status: job.published ? "Active" : "Draft",
    postedDate: job.postedDate || "-",
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your job posts.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border-4 border-black p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-gray-600 mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
              {stat.trend === "up" && (
                <div className="bg-green-100 p-2 rounded">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              )}
            </div>
            {stat.change ? (
              <p className="text-xs font-semibold text-gray-500 mt-2">
                {stat.change}
              </p>
            ) : null}
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
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Job Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Applicants
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Posted Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length === 0 ? (
                <tr className="border-b-2 border-gray-200">
                  <td className="px-6 py-8 text-center font-bold" colSpan={5}>
                    No job posts yet
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b-2 border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-semibold">{job.title}</td>
                    <td className="px-6 py-4">{job.applicants}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase ${
                          job.status === "Active"
                            ? "bg-green-100 text-green-800 border-2 border-green-800"
                            : "bg-gray-100 text-gray-800 border-2 border-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{job.postedDate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleView(job.id)}
                        className="px-4 py-2 text-xs font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/dashboard/job-post")}
          className="bg-primary hover:bg-primary-hover text-white font-black uppercase p-6 border-4 border-black transition-colors"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Post New Job
        </button>
        <button className="bg-white hover:bg-gray-100 text-black font-black uppercase p-6 border-4 border-black transition-colors">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Find Applicants
        </button>
        <button className="bg-white hover:bg-gray-100 text-black font-black uppercase p-6 border-4 border-black transition-colors">
          <svg
            className="w-8 h-8 mx-auto mb-2"
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                    <h3 className="text-3xl font-black uppercase mb-2">
                      {viewingJob.title}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      {viewingJob.department && (
                        <span>🏢 {viewingJob.department}</span>
                      )}
                      <span>📍 {viewingJob.location || "Not specified"}</span>
                      <span>
                        💼 {viewingJob.employmentType || "Not specified"}
                      </span>
                      {viewingJob.salary && <span>💰 {viewingJob.salary}</span>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-4 py-2 text-sm font-bold uppercase border-2 ${
                        viewingJob.published
                          ? "bg-green-100 text-green-800 border-green-800"
                          : "bg-yellow-100 text-yellow-800 border-yellow-800"
                      }`}
                    >
                      {viewingJob.published ? "✓ Published" : "📝 Draft"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-lg font-black uppercase mb-3">
                      Job Description
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewingJob.description || "No description provided"}
                    </p>
                  </div>

                  {/* Skills */}
                  {viewingJob.skills && viewingJob.skills.length > 0 && (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <h4 className="text-lg font-black uppercase mb-3">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingJob.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 border-2 border-black text-sm font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-lg font-black uppercase mb-3">
                      Posting Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold">Posted Date:</span>
                        <p className="text-gray-700">
                          {viewingJob.postedDate || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold">Expiry Date:</span>
                        <p className="text-gray-700">
                          {viewingJob.expiryDate || "No expiry set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setViewingJob(null);
                      }}
                      className="w-full px-6 py-3 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors"
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

export default DashboardPage;
