import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { useApp } from "../../../state/AppContext";

/**
 * ApplicantDetailPage - Detailed view of an applicant
 * Shows complete applicant profile information
 */
function ApplicantDetailPage() {
  const { applicantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const navigate = useNavigate();
  const { showError } = useApp();

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        setLoading(true);
        const data = await applicationService.getApplicantById(applicantId);
        setApplicant(data);
      } catch (error) {
        console.error("Failed to fetch applicant details:", error);
        showError("Failed to load applicant details");
      } finally {
        setLoading(false);
      }
    };

    if (applicantId) {
      fetchApplicant();
    }
  }, [applicantId, showError]);

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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-black uppercase mb-4">
                  {applicant.name || "Unknown"}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  {applicant.email && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">✉️</span>
                      <span className="font-bold">{applicant.email}</span>
                    </div>
                  )}
                  {applicant.phone && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">📱</span>
                      <span className="font-bold">{applicant.phone}</span>
                    </div>
                  )}
                  {applicant.location && (
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-2 border-black">
                      <span className="text-lg">📍</span>
                      <span className="font-bold">{applicant.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          {applicant.summary && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Professional Summary
                </h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {applicant.summary}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          {applicant.skills && applicant.skills.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Skills</h3>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {applicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white border-4 border-black text-sm font-bold uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience */}
          {applicant.experience && applicant.experience.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">
                  Work Experience
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {applicant.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-black pl-6 pb-6 last:pb-0"
                  >
                    <h4 className="text-lg font-black uppercase mb-2">
                      {exp.title || exp.position}
                    </h4>
                    <p className="font-bold text-gray-700 mb-2">
                      {exp.company}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {applicant.education && applicant.education.length > 0 && (
            <div className="bg-white border-4 border-black">
              <div className="border-b-4 border-black p-6">
                <h3 className="text-xl font-black uppercase">Education</h3>
              </div>
              <div className="p-8 space-y-6">
                {applicant.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-black pl-6 pb-6 last:pb-0"
                  >
                    <h4 className="text-lg font-black uppercase mb-2">
                      {edu.degree}
                    </h4>
                    <p className="font-bold text-gray-700 mb-2">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-gray-600">
                      {edu.startYear} - {edu.endYear || "Present"}
                    </p>
                  </div>
                ))}
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
                <div className="bg-gray-50 border-2 border-gray-300 p-4">
                  <p className="text-sm font-black uppercase text-gray-600 mb-2">
                    Applicant ID
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {applicant.id || applicantId}
                  </p>
                </div>
                {applicant.expectedSalary && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="text-sm font-black uppercase text-gray-600 mb-2">
                      Expected Salary
                    </p>
                    <p className="text-lg font-bold">
                      {applicant.expectedSalary}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantDetailPage;
