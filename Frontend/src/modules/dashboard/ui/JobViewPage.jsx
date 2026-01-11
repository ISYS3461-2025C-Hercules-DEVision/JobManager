import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jobService } from "../services/jobService";

function JobViewPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");
  const [loadingView, setLoadingView] = useState(true);
  const [job, setJob] = useState(null);
  const navigate = useNavigate();
  const handleEdit = (jobId) => {
    navigate(`/dashboard/job-post?id=${jobId}`);
  };
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoadingView(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setLoadingView(false);
      }
    };
    fetchJob();
  }, []);
  return (
    <div className="w-full max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Job Details</h1>
        <p className="text-gray-600">View your job post details</p>
      </div>

      {/* Modal Content */}
      {loadingView ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 font-bold">Loading job details...</p>
        </div>
      ) : job ? (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-3xl font-black uppercase mb-2">{job.title}</h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📍 {job.location || "Not specified"}</span>
              <span>💼 {job.employmentType || "Not specified"}</span>
              {job.salary && <span>💰 {job.salary}</span>}
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`inline-block px-4 py-2 text-sm font-bold uppercase border-2 ${
                job.published
                  ? "bg-green-100 text-green-800 border-green-800"
                  : "bg-yellow-100 text-yellow-800 border-yellow-800"
              }`}
            >
              {job.published ? "✓ Published" : "📝 Draft"}
            </span>
          </div>

          {/* Description */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h4 className="text-lg font-black uppercase mb-3">
              Job Description
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.description || "No description provided"}
            </p>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-6">
              <h4 className="text-lg font-black uppercase mb-3">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
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
                  {job.postedDate || "Not specified"}
                </p>
              </div>
              <div>
                <span className="font-bold">Expiry Date:</span>
                <p className="text-gray-700">
                  {job.expiryDate || "No expiry set"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-2 border-gray-200 pt-6 flex gap-4">
            <button
              onClick={() => {
                handleEdit(job.id);
              }}
              className="flex-1 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
            >
              Edit Job Post
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load job details</p>
        </div>
      )}
    </div>
  );
}

export default JobViewPage;
