import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jobService } from "../services/jobService";
import { applicationService } from "../services/applicationService";
import { useProfile } from "../../../state/ProfileContext";
import { useApp } from "../../../state/AppContext";

/**
 * JobViewPage - Detailed view of a job posting
 * Shows all job information with brutalist design
 */
function JobViewPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicants, setApplicants] = useState({}); // Map of applicantId -> applicant details
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { showSuccess, showError } = useApp();

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

  // Fetch applications when job and profile are loaded
  useEffect(() => {
    const fetchApplications = async () => {
      if (!job || !profile?.companyId) return;

      try {
        setLoadingApplications(true);
        const apps = await applicationService.getApplicationsForJobPost(jobId);
        console.log("Applications:", apps);
        setApplications(apps);

        // Fetch applicant details for each application
        const applicantDetails = {};
        for (const app of apps) {
          try {
            const applicant = await applicationService.getApplicantById(
              app.applicantId
            );
            applicantDetails[app.applicantId] = applicant;
          } catch (error) {
            console.error(
              `Failed to fetch applicant ${app.applicantId}:`,
              error
            );
          }
        }
        setApplicants(applicantDetails);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        showError("Failed to load applications");
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [job, profile, jobId, showError]);

  const handleApprove = async (applicationId) => {
    try {
      await applicationService.approveApplication(jobId, applicationId, "Application approved - strong profile");
      showSuccess("Application approved successfully");
      // Refresh applications
      const apps = await applicationService.getApplicationsForJobPost(jobId);
      setApplications(apps);
    } catch (error) {
      console.error("Failed to approve application:", error);
      showError("Failed to approve application");
    }
  };

  const handleReject = async (applicationId) => {
    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }

    try {
      await applicationService.rejectApplication(jobId, applicationId, "Application rejected - requirements not met");
      showSuccess("Application rejected");
      // Refresh applications
      const apps = await applicationService.getApplicationsForJobPost(jobId);
      setApplications(apps);
    } catch (error) {
      console.error("Failed to reject application:", error);
      showError("Failed to reject application");
    }
  };

  const handleViewApplicant = (applicantId) => {
    navigate(`/dashboard/applicant/${applicantId}`);
  };

  const handleDownloadCV = (cvUrl) => {
    if (!cvUrl) {
      showError("CV not available");
      return;
    }
    window.open(cvUrl, "_blank");
  };

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
                      {Array.isArray(job.employmentTypes) && job.employmentTypes.length > 0
                        ? job.employmentTypes.join(", ")
                        : job.employmentType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                    <span className="text-lg">💰</span>
                    <span className="font-bold">
                      {(() => {
                        if (!job.salaryType) return "Not specified";
                        const currency = job.salaryCurrency || "USD";
                        switch (job.salaryType) {
                          case "RANGE":
                            return `${job.salaryMin}-${job.salaryMax} ${currency}`;
                          case "ABOUT":
                            return `About ${job.salaryMin} ${currency}`;
                          case "UP_TO":
                            return `Up to ${job.salaryMax} ${currency}`;
                          case "FROM":
                            return `From ${job.salaryMin} ${currency}`;
                          case "NEGOTIABLE":
                            return "Negotiable";
                          default:
                            return "Not specified";
                        }
                      })()}
                    </span>
                  </div>
                  {job.department && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">🏢</span>
                      <span className="font-bold">{job.department}</span>
                    </div>
                  )}
                  {job.experienceLevel && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">📊</span>
                      <span className="font-bold">{job.experienceLevel}</span>
                    </div>
                  )}
                </div>
              </div>
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

          {/* Requirements Card */}
          {job.requirements && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Requirements</h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>
          )}

          {/* Responsibilities Card */}
          {job.responsibilities && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Key Responsibilities</h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.responsibilities}
                </p>
              </div>
            </div>
          )}

          {/* Benefits Card */}
          {job.benefits && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Benefits</h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.benefits}
                </p>
              </div>
            </div>
          )}

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

          {/* Applications Section */}
          <div className="bg-white border-4 border-black">
            <div className="border-b-4 border-black p-6 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase">
                Applications ({applications.length})
              </h3>
              {loadingApplications && (
                <div className="text-sm font-bold text-gray-600">
                  Loading...
                </div>
              )}
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl font-bold text-gray-600">
                    No applications yet
                  </p>
                  <p className="text-gray-500 mt-2">
                    Applications for this job will appear here
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b-4 border-black">
                    <tr className="bg-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-black uppercase">
                        Applicant Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase">
                        Applicant ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase">
                        Applied Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase">
                        CV
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const applicant = applicants[app.applicantId];
                      const cvUrl = app.fileUrl?.[0] || null; // First document is CV (API returns fileUrl, not fileUrls)

                      return (
                        <tr
                          key={app.applicationId}
                          className="border-b-2 border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-semibold">
                            {applicant?.name || "Loading..."}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                handleViewApplicant(app.applicantId)
                              }
                              className="text-blue-600 hover:text-blue-800 font-bold underline"
                            >
                              {app.applicantId}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {app.timeApplied
                              ? new Date(app.timeApplied).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {cvUrl ? (
                              <button
                                onClick={() => handleDownloadCV(cvUrl)}
                                className="px-3 py-1 text-xs font-bold uppercase border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                              >
                                📄 Download CV
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                No CV
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(app.applicationId)}
                                className="px-3 py-1 text-xs font-bold uppercase bg-green-100 border-2 border-green-600 text-green-800 hover:bg-green-600 hover:text-white transition-colors"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleReject(app.applicationId)}
                                className="px-3 py-1 text-xs font-bold uppercase bg-red-100 border-2 border-red-600 text-red-800 hover:bg-red-600 hover:text-white transition-colors"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobViewPage;
