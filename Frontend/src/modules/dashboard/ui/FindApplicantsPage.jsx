import { useState } from 'react';

/**
 * FindApplicantsPage - Search and filter applicants
 * Features: Advanced search, filters, applicant cards
 */
function FindApplicantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    skills: '',
  });

  // Mock applicant data
  const applicants = [
    {
      id: 1,
      name: 'John Doe',
      title: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      experience: '5 years',
      skills: ['React', 'TypeScript', 'Node.js'],
      avatar: null,
      matchScore: 95,
    },
    {
      id: 2,
      name: 'Jane Smith',
      title: 'Full Stack Engineer',
      location: 'New York, NY',
      experience: '7 years',
      skills: ['React', 'Python', 'AWS'],
      avatar: null,
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      title: 'Backend Developer',
      location: 'Austin, TX',
      experience: '4 years',
      skills: ['Java', 'Spring Boot', 'PostgreSQL'],
      avatar: null,
      matchScore: 82,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Find Applicants</h1>
        <p className="text-gray-600">Search and connect with talented professionals</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-4 border-black p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold uppercase mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, skills, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
            >
              <option value="">All Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Location</label>
            <input
              type="text"
              placeholder="City, State"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Applicants
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase">
          Found {applicants.length} Applicants
        </h2>
        <select className="px-4 py-2 border-2 border-black font-bold text-sm">
          <option>Sort by: Best Match</option>
          <option>Sort by: Experience</option>
          <option>Sort by: Recent</option>
        </select>
      </div>

      {/* Applicant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="bg-white border-4 border-black hover:shadow-lg transition-shadow">
            {/* Match Score Badge */}
            <div className="bg-primary text-white px-4 py-2 font-black text-sm flex items-center justify-between">
              <span>MATCH SCORE</span>
              <span>{applicant.matchScore}%</span>
            </div>

            <div className="p-6">
              {/* Avatar and Name */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center font-black text-xl">
                  {applicant.avatar ? (
                    <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                  ) : (
                    applicant.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg">{applicant.name}</h3>
                  <p className="text-sm font-semibold text-gray-600">{applicant.title}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">{applicant.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{applicant.experience} experience</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 border-2 border-black text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold uppercase text-sm border-2 border-black transition-colors">
                  Contact
                </button>
                <button className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white font-bold uppercase text-sm transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FindApplicantsPage;

