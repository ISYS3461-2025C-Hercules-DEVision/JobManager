import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { useApp } from "../../../state/AppContext";

/**
 * ApplicantDetailPage - Detailed view of an applicant
 * Shows complete applicant profile information
 */
function ApplicantDetailPage() {
  const { applicationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const navigate = useNavigate();
  const { showError } = useApp();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const data = await applicationService.getApplicationById(applicationId);
        setApplication(data);
      } catch (error) {
        console.error("Failed to fetch application details:", error);
        showError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, showError]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase mb-2">
              Application Details
            </h1>
            <p className="text-gray-600">
              Review application and candidate documents
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white border-4 border-black font-bold uppercase hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mb-4"></div>
          <p className="text-xl font-bold uppercase">
            Loading application details...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && !application && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black uppercase mb-2">
            Application Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-black text-white border-4 border-black font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Application Content */}
      {!loading && application && (
        <div className="space-y-6">
          {/* Application Status Card */}
          <div className="bg-white border-4 border-black p-8">
            <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">
              Application Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Status
                </p>
                <span
                  className={`inline-block px-4 py-2 text-sm font-bold uppercase border-2 ${
                    application.status === "APPROVED"
                      ? "bg-green-100 text-green-800 border-green-800"
                      : application.status === "REJECTED"
                      ? "bg-red-100 text-red-800 border-red-800"
                      : "bg-yellow-100 text-yellow-800 border-yellow-800"
                  }`}
                >
                  {application.status}
                </span>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Submitted Date
                </p>
                <p className="text-lg font-bold">
                  {new Date(application.submissionDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Last Updated
                </p>
                <p className="text-lg font-bold">
                  {new Date(application.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            {application.feedback && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-300 p-4">
                <p className="text-sm font-black uppercase text-blue-600 mb-2">
                  Feedback
                </p>
                <p className="text-gray-800">{application.feedback}</p>
              </div>
            )}
          </div>

          {/* CV/Documents Card */}
          <div className="bg-white border-4 border-black p-8">
            <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">
              Application Documents
            </h3>
            
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-4">
                {application.documents.map((doc, index) => (
                  <div
                    key={doc.fileId}
                    className="bg-gray-50 border-2 border-gray-300 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">📄</span>
                          <div>
                            <p className="text-sm font-black uppercase text-gray-600">
                              {doc.fileType} Document
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* CV Preview (if PDF) */}
                        {doc.fileType === "PDF" && (
                          <div className="mt-4 border-2 border-black">
                            <iframe
                              src={doc.fileUrl}
                              className="w-full h-96"
                              title={`Document ${index + 1}`}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Download Button */}
                      <div className="ml-6">
                        <a
                          href={doc.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-4 border-4 border-black hover:bg-gray-800 transition-colors font-bold uppercase text-sm"
                        >
                          <span>⬇</span>
                          Download CV
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-300 p-8 text-center">
                <p className="font-bold uppercase text-sm text-gray-500">
                  No documents attached to this application
                </p>
              </div>
            )}
          </div>

          {/* IDs Reference */}
          <div className="bg-white border-4 border-black p-8">
            <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">
              Reference Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Application ID
                </p>
                <p className="text-sm font-mono break-all">
                  {application.applicationId}
                </p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Applicant ID
                </p>
                <p className="text-sm font-mono break-all">
                  {application.applicantId}
                </p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Job Post ID
                </p>
                <p className="text-sm font-mono break-all">
                  {application.jobPostId}
                </p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 p-4">
                <p className="text-sm font-black uppercase text-gray-600 mb-2">
                  Company ID
                </p>
                <p className="text-sm font-mono break-all">
                  {application.companyId}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantDetailPage;
