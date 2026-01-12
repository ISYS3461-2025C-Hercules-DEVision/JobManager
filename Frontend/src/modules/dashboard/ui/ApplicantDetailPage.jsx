import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { useApp } from "../../../state/AppContext";
import { ENV } from "../../../config/env";

/**
 * ApplicantDetailPage - Detailed view of an applicant
 * Shows complete applicant profile information
 */
function ApplicantDetailPage() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();
  const { showError } = useApp();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        // Fetch application details (for CV/documents)
        const appData = await applicationService.getApplicationById(
          applicationId
        );
        setApplication(appData);

        // Fetch applicant profile (for personal info)
        if (appData.applicantId) {
          const applicantData = await applicationService.getApplicantById(
            appData.applicantId
          );
          setApplicant(applicantData);

          // Fetch applicant resume (for skills, education, experience)
          try {
            const resumeData = await applicationService.getApplicantResume(
              appData.applicantId
            );
            setResume(resumeData);
            console.log("Resume data:", resumeData);
          } catch (resumeError) {
            console.log("Resume not available:", resumeError);
            // Resume is optional, don't throw error
          }
        }
      } catch (error) {
        console.error("Failed to fetch application details:", error);
        showError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    console.log(applicationId);

    if (applicationId) {
      fetchApplicationData();
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
              Applicant Profile
            </h1>
            <p className="text-gray-600">
              Complete information about this candidate
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
            Loading applicant details...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && !applicant && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black uppercase mb-2">
            Applicant Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The applicant you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-black text-white border-4 border-black font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Applicant Content */}
      {!loading && applicant && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white border-4 border-black p-8">
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              {applicant.profileImageUrl ? (
                <img
                  src={applicant.profileImageUrl}
                  alt={applicant.fullName}
                  className="w-32 h-32 object-cover border-4 border-black"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 border-4 border-black flex items-center justify-center">
                  <span className="text-5xl">👤</span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-black uppercase">
                    {applicant.fullName || applicant.name || "Unknown"}
                  </h2>

                  {/* Status Badges */}
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                        applicant.activated
                          ? "bg-green-100 text-green-800 border-green-800"
                          : "bg-red-100 text-red-800 border-red-800"
                      }`}
                    >
                      {applicant.activated ? "✓ Activated" : "✗ Not Activated"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                        applicant.employmentStatus
                          ? "bg-blue-100 text-blue-800 border-blue-800"
                          : "bg-gray-100 text-gray-800 border-gray-800"
                      }`}
                    >
                      {applicant.employmentStatus
                        ? "💼 Employed"
                        : "🔍 Seeking"}
                    </span>
                    {applicant.archived && (
                      <span className="px-3 py-1 text-xs font-bold uppercase border-2 bg-yellow-100 text-yellow-800 border-yellow-800">
                        📦 Archived
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {applicant.email && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">✉️</span>
                      <span className="font-bold">{applicant.email}</span>
                    </div>
                  )}
                  {applicant.phoneNumber && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">📱</span>
                      <span className="font-bold">{applicant.phoneNumber}</span>
                    </div>
                  )}
                  {(applicant.city || applicant.location) && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">📍</span>
                      <span className="font-bold">
                        {applicant.city || applicant.location}
                        {applicant.country && `, ${applicant.country}`}
                      </span>
                    </div>
                  )}
                  {applicant.streetAddress && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">🏠</span>
                      <span className="font-bold">
                        {applicant.streetAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          {(resume?.objective || applicant.summary) && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Professional Summary
                </h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {resume?.objective || applicant.summary}
                </p>
              </div>
            </div>
          )}

          {/* Skills - prioritize resume data */}
          {((resume?.skills && resume.skills.length > 0) ||
            (applicant.skills && applicant.skills.length > 0)) && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Skills</h3>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {(resume?.skills || applicant.skills || []).map(
                    (skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white border-4 border-black text-sm font-bold uppercase"
                      >
                        {typeof skill === "string"
                          ? skill
                          : skill.name || skill.skillName}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Experience - prioritize resume data */}
          {((resume?.experience && resume.experience.length > 0) ||
            (applicant.experience && applicant.experience.length > 0)) && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Work Experience
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {(resume?.experience || applicant.experience || []).map(
                  (exp, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-black pl-6 pb-6 last:pb-0"
                    >
                      <h4 className="text-lg font-black uppercase mb-2">
                        {exp.jobTitle || exp.title || exp.position}
                      </h4>
                      <p className="font-bold text-gray-700 mb-2">
                        {exp.companyName || exp.company}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {exp.fromYear || exp.startDate} -{" "}
                        {exp.toYear ||
                          exp.endDate ||
                          (exp.currentlyWorking ? "Present" : "")}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Education - prioritize resume data */}
          {((resume?.education && resume.education.length > 0) ||
            (applicant.education && applicant.education.length > 0)) && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Education</h3>
              </div>
              <div className="p-8 space-y-6">
                {(resume?.education || applicant.education || []).map(
                  (edu, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-black pl-6 pb-6 last:pb-0"
                    >
                      <h4 className="text-lg font-black uppercase mb-2">
                        {edu.degree || edu.degreeType}
                      </h4>
                      <p className="font-bold text-gray-700 mb-2">
                        {edu.institution || edu.institutionName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {edu.fromYear || edu.startYear || edu.startDate} -{" "}
                        {edu.toYear || edu.endYear || edu.endDate || "Present"}
                      </p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Field: {edu.fieldOfStudy}
                        </p>
                      )}
                      {edu.gpa && (
                        <p className="text-sm text-gray-600 mt-1">
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Certifications - from resume data */}
          {resume?.certifications && resume.certifications.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Certifications</h3>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {resume.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white border-4 border-black text-sm font-bold uppercase"
                    >
                      {typeof cert === "string"
                        ? cert
                        : cert.name || cert.certificationName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects - from resume data */}
          {resume?.projects && resume.projects.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Projects</h3>
              </div>
              <div className="p-8 space-y-6">
                {resume.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-black pl-6 pb-6 last:pb-0"
                  >
                    <h4 className="text-lg font-black uppercase mb-2">
                      {project.title || project.projectName}
                    </h4>
                    {project.description && (
                      <p className="text-gray-700 whitespace-pre-wrap mb-2">
                        {project.description}
                      </p>
                    )}
                    {(project.startDate || project.endDate) && (
                      <p className="text-sm text-gray-600">
                        {project.startDate}{" "}
                        {project.endDate && `- ${project.endDate}`}
                      </p>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.technologies.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="px-3 py-1 bg-gray-200 border-2 border-gray-400 text-xs font-bold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages - from resume data */}
          {resume?.languages && resume.languages.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Languages</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {resume.languages.map((lang, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border-2 border-gray-300 p-4"
                    >
                      <p className="font-bold text-lg mb-1">
                        {lang.language || lang.languageName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lang.proficiency || lang.proficiencyLevel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white border-4 border-black">
            <div className="border-b-4 border-black p-6">
              <h3 className="text-xl font-black uppercase">
                Additional Information
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applicant.expectedSalary && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-2">
                      Expected Salary
                    </p>
                    <p className="text-lg font-bold">
                      ${applicant.expectedSalary.toLocaleString()}
                    </p>
                  </div>
                )}
                {applicant.availability && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-2">
                      Availability
                    </p>
                    <p className="text-lg font-bold">
                      {applicant.availability}
                    </p>
                  </div>
                )}
                {applicant.yearsOfExperience !== undefined && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-2">
                      Years of Experience
                    </p>
                    <p className="text-lg font-bold">
                      {applicant.yearsOfExperience} years
                    </p>
                  </div>
                )}
                {applicant.createdAt && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-2">
                      Member Since
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(applicant.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume & Portfolio from Applicant */}
          {(resume?.resumeId ||
            applicant.resumeId ||
            (applicant.mediaPortfolios &&
              applicant.mediaPortfolios.length > 0)) && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Documents & Portfolio
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {/* Resume from resume API */}
                {resume?.resumeId && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-3">
                      Resume
                    </p>
                    {resume.headline && (
                      <p className="text-lg font-bold mb-3">
                        {resume.headline}
                      </p>
                    )}
                    <a
                      href={`${
                        ENV.APPLICANT_SERVICE_URL ||
                        "http://13.210.119.17:10789"
                      }/api/v1/applicants/${resume.applicantId}/resumes/${
                        resume.resumeId
                      }/download`}
                      download
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm"
                    >
                      <span>📄</span>
                      Download Resume
                    </a>
                  </div>
                )}

                {/* Resume from applicant profile */}
                {!resume?.resumeId && applicant.resumeId && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-3">
                      Resume
                    </p>
                    <a
                      href={`/api/files/${applicant.resumeId}`}
                      download
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm"
                    >
                      <span>📄</span>
                      Download Resume
                    </a>
                  </div>
                )}

                {applicant.mediaPortfolios &&
                  applicant.mediaPortfolios.length > 0 && (
                    <div className="bg-gray-50 border-2 border-gray-300 p-4">
                      <p className="text-sm font-black uppercase text-gray-600 mb-3">
                        Media Portfolio
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {applicant.mediaPortfolios.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-bold text-sm"
                          >
                            <span>🔗</span>
                            Portfolio {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Application Status Card (if application data exists) */}
          {application && (
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
                    {new Date(application.submissionDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-300 p-4">
                  <p className="text-sm font-black uppercase text-gray-600 mb-2">
                    Last Updated
                  </p>
                  <p className="text-lg font-bold">
                    {new Date(application.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
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
          )}

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
                              Uploaded:{" "}
                              {new Date(doc.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        {/* CV Preview (if PDF) */}
                        {doc.fileType === "PDF" && (
                          <div className="mt-4 border-2 border-black">
                            <iframe
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                doc.fileUrl
                              )}&embedded=true`}
                              className="w-full h-96"
                              title="PDF Preview"
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
