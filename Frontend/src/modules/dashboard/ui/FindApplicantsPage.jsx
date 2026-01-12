import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { useApp } from '../../../state/AppContext';

const DEGREE_TYPES = [
  { value: '', label: 'All Degrees' },
  { value: 'BACHELOR', label: 'Bachelor' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * FindApplicantsPage - Search and filter applicants
 * Features: Advanced search, filters, applicant cards
 */
function FindApplicantsPage() {
  const navigate = useNavigate();
  const { showError } = useApp();
  const [loading, setLoading] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 10,
  });
  
  const [filters, setFilters] = useState({
    degree: '',
    skills: '',
    matchAllSkills: false,
  });

  const [skillsInput, setSkillsInput] = useState('');

  const searchApplicants = async (page = 1) => {
    try {
      setLoading(true);
      
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const filterParams = {
        matchAllSkills: filters.matchAllSkills,
        take: pagination.size,
        page: page,
      };

      // Only add degree if selected
      if (filters.degree && filters.degree.trim() !== '') {
        filterParams.degree = filters.degree;
      }

      // Only add skills if provided
      if (skillsArray.length > 0) {
        filterParams.skills = skillsArray;
      }

      const result = await applicationService.filterApplicants(filterParams);

      setApplicants(result.content || []);
      setPagination({
        currentPage: result.number + 1,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        size: result.size,
      });
    } catch (error) {
      console.error('Failed to search applicants:', error);
      showError('Failed to search applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchApplicants();
  }, []);

  const handleSearch = () => {
    searchApplicants(1);
  };

  const handlePageChange = (newPage) => {
    searchApplicants(newPage);
  };

  const handleViewApplicant = (applicationId) => {
    navigate(`/dashboard/applicant-details?applicationId=${applicationId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Find Applicants</h1>
        <p className="text-gray-600">Search and connect with talented professionals</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-4 border-black p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Degree Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Degree</label>
            <select
              value={filters.degree}
              onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
            >
              {DEGREE_TYPES.map((degree) => (
                <option key={degree.value} value={degree.value}>
                  {degree.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Skills</label>
            <input
              type="text"
              placeholder="Java, React, Python (comma-separated)"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          {/* Match All Skills Checkbox */}
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.matchAllSkills}
                onChange={(e) => setFilters({ ...filters, matchAllSkills: e.target.checked })}
                className="w-5 h-5 border-2 border-black"
              />
              <span className="text-sm font-bold uppercase">Match All Skills</span>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Applicants
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase">
          {loading ? 'Searching...' : `Found ${pagination.totalElements} Applicants`}
        </h2>
        <div className="text-sm font-bold">
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mb-4"></div>
          <p className="text-xl font-bold uppercase">Loading applicants...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && applicants.length === 0 && (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black uppercase mb-2">No Applicants Found</h2>
          <p className="text-gray-600">Try adjusting your filters or search criteria</p>
        </div>
      )}

      {/* Applicant Cards Grid */}
      {!loading && applicants.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((applicant) => (
              <div key={applicant.applicantId} className="bg-white border-4 border-black hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Avatar and Name */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center font-black text-xl">
                      {applicant.profileImageUrl ? (
                        <img src={applicant.profileImageUrl} alt={applicant.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (applicant.fullName || 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg">{applicant.fullName || 'Unknown'}</h3>
                      <p className="text-sm font-semibold text-gray-600">{applicant.email}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {(applicant.city || applicant.country) && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold">
                          {[applicant.city, applicant.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {applicant.phoneNumber && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-semibold">{applicant.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  {applicant.highestDegree && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase text-gray-600 mb-2">Education</p>
                      <span className="px-3 py-1 bg-blue-100 border-2 border-blue-800 text-sm font-bold text-blue-800">
                        {applicant.highestDegree}
                      </span>
                    </div>
                  )}

                  {/* Skills */}
                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase text-gray-600 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 border-2 border-black text-xs font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                        {applicant.skills.length > 5 && (
                          <span className="px-2 py-1 text-xs font-bold text-gray-500">
                            +{applicant.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewApplicant(applicant.applicantId)}
                      className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold uppercase text-sm border-2 border-black transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-4 py-2 border-2 border-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <span className="px-4 py-2 font-bold">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                className="px-4 py-2 border-2 border-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FindApplicantsPage;

