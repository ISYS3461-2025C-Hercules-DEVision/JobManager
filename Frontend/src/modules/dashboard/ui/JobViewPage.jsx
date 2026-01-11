import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jobService } from "../services/jobService";

/**
 * JobViewPage - Detailed view of a job posting
 * Shows all job information with brutalist design
 */
function JobViewPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleEdit = () => {
    navigate(`/dashboard/job-post?id=${jobId}`);
  };

  const handleBack = () => {
    navigate("/dashboard/post-manager");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase mb-2">Job Details</h1>
            <p className="text-gray-600">
              Complete information about this job posting
            </p>
          </div>
          <div>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white border-4 border-black font-bold uppercase hover:bg-gray-100 transition-colors mr-2"
            >
              ← Back
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-3 bg-white border-4 border-black font-bold uppercase hover:bg-gray-100 transition-colors mr-2"
            >
              ✏️ Edit Job Post
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this job post?")) {
                  // TODO: Implement delete functionality
                  console.log("Delete job:", jobId);
                }
              }}
              className="px-6 py-3 bg-white text-red-600 border-4 border-red-600 font-black uppercase hover:bg-red-50 transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mb-4"></div>
          <p className="text-xl font-bold uppercase">Loading job details...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && !job && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black uppercase mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-black text-white border-4 border-black font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Job Content */}
      {!loading && job && (
        <div className="space-y-6">
          {/* Job Header Card */}
          <div className="bg-white border-4 border-black p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-black uppercase mb-4">
                  {job.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                    <span className="text-lg">📍</span>
                    <span className="font-bold">
                      {job.location || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                    <span className="text-lg">💼</span>
                    <span className="font-bold">
                      {job.employmentType || "Not specified"}
                    </span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">💰</span>
                      <span className="font-bold">{job.salary}</span>
                    </div>
                  )}
                  {job.department && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">🏢</span>
                      <span className="font-bold">{job.department}</span>
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`px-6 py-3 text-sm font-black uppercase border-4 whitespace-nowrap ${
                  job.published
                    ? "bg-green-100 text-green-800 border-green-800"
                    : "bg-yellow-100 text-yellow-800 border-yellow-800"
                }`}
              >
                {job.published ? "✓ Published" : "📝 Draft"}
              </span>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white border-4 border-black">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-black uppercase">Job Description</h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description || (
                  <span className="text-gray-400 italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Skills Card */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Required Skills
                </h3>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white border-4 border-black text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posting Information Card */}
          <div className="bg-white border-4 border-black">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-black uppercase">
                Posting Information
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border-2 border-gray-300 p-4">
                  <p className="text-sm font-black uppercase text-gray-600 mb-2">
                    Posted Date
                  </p>
                  <p className="text-lg font-bold">
                    {job.postedDate || (
                      <span className="text-gray-400 italic">
                        Not specified
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-300 p-4">
                  <p className="text-sm font-black uppercase text-gray-600 mb-2">
                    Expiry Date
                  </p>
                  <p className="text-lg font-bold">
                    {job.expiryDate || (
                      <span className="text-gray-400 italic">
                        No expiry set
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-black uppercase">Applications</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobViewPage;
