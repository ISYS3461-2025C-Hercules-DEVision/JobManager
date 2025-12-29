import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';

/**
 * JobPostPage - Create and edit job posts
 * Features: Rich form with validation, preview mode
 */
function JobPostPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',
    experienceLevel: 'Mid-level',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitError(null);
      setSubmitting(true);
      try {
        await jobService.createJob(formData);
        navigate('/dashboard/post-manager');
      } catch (err) {
        console.error('Create job failed:', err);
        setSubmitError(err.message || 'Failed to publish job post');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    // Handle save draft
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Create Job Post</h1>
        <p className="text-gray-600">Fill in the details to create a new job posting</p>
        {submitError && (
          <p className="mt-3 text-primary font-bold">{submitError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase mb-6">Basic Information</h2>

              <div className="space-y-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">
                    Job Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Frontend Developer"
                    className={`w-full px-4 py-3 border-2 ${
                      errors.title ? 'border-primary' : 'border-black'
                    } focus:outline-none focus:border-primary font-semibold`}
                  />
                  {errors.title && <p className="text-primary text-sm font-bold mt-1">{errors.title}</p>}
                </div>

                {/* Department and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Department <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Engineering"
                      className={`w-full px-4 py-3 border-2 ${
                        errors.department ? 'border-primary' : 'border-black'
                      } focus:outline-none focus:border-primary font-semibold`}
                    />
                    {errors.department && <p className="text-primary text-sm font-bold mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Location <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Remote, New York, NY"
                      className={`w-full px-4 py-3 border-2 ${
                        errors.location ? 'border-primary' : 'border-black'
                      } focus:outline-none focus:border-primary font-semibold`}
                    />
                    {errors.location && <p className="text-primary text-sm font-bold mt-1">{errors.location}</p>}
                  </div>
                </div>

                {/* Job Type and Experience Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Job Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    >
                      <option>Entry-level</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                      <option>Lead</option>
                      <option>Executive</option>
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Salary Range (Optional)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      placeholder="Min (USD)"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      placeholder="Max (USD)"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase mb-6">Job Description</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">
                    Description <span className="text-primary">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Provide a detailed description of the role..."
                    className={`w-full px-4 py-3 border-2 ${
                      errors.description ? 'border-primary' : 'border-black'
                    } focus:outline-none focus:border-primary font-semibold resize-none`}
                  />
                  {errors.description && <p className="text-primary text-sm font-bold mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows={6}
                    placeholder="List key responsibilities (one per line)..."
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={6}
                    placeholder="List job requirements (one per line)..."
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Required Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, TypeScript, Node.js (comma separated)"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Benefits</label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                    placeholder="List benefits and perks (one per line)..."
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Actions and Tips */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-xl font-black uppercase mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors"
                >
                  {submitting ? 'Publishing...' : 'Publish Job Post'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-xl font-black uppercase mb-4">Tips</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary font-black mr-2">•</span>
                  <span className="font-semibold">Be specific about the role and requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black mr-2">•</span>
                  <span className="font-semibold">Include salary range to attract more applicants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black mr-2">•</span>
                  <span className="font-semibold">Highlight benefits and company culture</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black mr-2">•</span>
                  <span className="font-semibold">Use clear, concise language</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-xl font-black uppercase mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                  <span className="font-bold text-sm">Active Posts</span>
                  <span className="font-black text-lg">12</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                  <span className="font-bold text-sm">Total Views</span>
                  <span className="font-black text-lg">3.2K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Applicants</span>
                  <span className="font-black text-lg">234</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default JobPostPage;

