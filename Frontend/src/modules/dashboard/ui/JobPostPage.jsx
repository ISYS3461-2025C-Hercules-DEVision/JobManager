import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jobService } from "../services/jobService";

// Common technical skills for suggestions
const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Oracle', 'Cassandra',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD',
  'Kafka', 'RabbitMQ', 'GraphQL', 'REST API', 'Microservices', 'Agile', 'Scrum',
  'Git', 'Linux', 'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch'
];

/**
 * SkillTagInput - Component for managing skill tags
 * Allows adding/removing technical skills as tags with autocomplete suggestions
 */
function SkillTagInput({ skills, onSkillsChange, error }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    skill => 
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !skills.some(s => s.toLowerCase() === skill.toLowerCase())
  ).slice(0, 8);

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    // Check for duplicates (case-insensitive) and max limit
    const isDuplicate = skills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase());
    if (trimmedSkill && !isDuplicate && skills.length < 20) {
      onSkillsChange([...skills, trimmedSkill]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-bold uppercase mb-2">
        Technical Skills & Competencies
      </label>
      
      {/* Tags Display */}
      <div className={`min-h-[52px] px-3 py-2 border-2 ${error ? 'border-primary' : 'border-black'} bg-white flex flex-wrap gap-2 items-center`}>
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white font-bold text-sm border-2 border-black"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 hover:text-gray-200 font-black"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={skills.length === 0 ? "Type a skill and press Enter (e.g., Python, Kafka, SQL)" : "Add more..."}
          className="flex-1 min-w-[150px] py-1 focus:outline-none font-semibold"
        />
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black max-h-48 overflow-y-auto">
          {filteredSuggestions.map((skill, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addSkill(skill)}
              className="w-full px-4 py-2 text-left font-semibold hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
            >
              {skill}
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="text-primary text-sm font-bold mt-1">{error}</p>}
      
      {/* Quick Add Suggestions */}
      {skills.length < 5 && (
        <div className="mt-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Quick add: </span>
          <div className="inline-flex flex-wrap gap-1 mt-1">
            {SUGGESTED_SKILLS.filter(s => !skills.some(sk => sk.toLowerCase() === s.toLowerCase())).slice(0, 6).map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-2 py-1 text-xs font-bold border border-gray-300 hover:border-black hover:bg-gray-100 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * JobPostPage - Create and edit job posts
 * Features: Rich form with validation, preview mode
 */
function JobPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");
  const isEditMode = !!jobId;

  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employmentTypes: ["Full-time"],
    salaryType: "RANGE",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: [], // Array for tag management
    experienceLevel: "Mid-level",
    published: true,
    expiryDate: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEditMode && jobId) {
      const loadJob = async () => {
        try {
          const job = await jobService.getJobById(jobId);

          setFormData({
            title: job.title || "",
            department: job.department || "",
            location: job.location || "",
            employmentTypes: Array.isArray(job.employmentTypes) ? job.employmentTypes : [job.employmentTypes || "Full-time"],
            salaryType: job.salaryType || "RANGE",
            salaryMin: job.salaryMin || "",
            salaryMax: job.salaryMax || "",
            salaryCurrency: job.salaryCurrency || "USD",
            description: job.description || "",
            requirements: job.requirements || "",
            responsibilities: job.responsibilities || "",
            benefits: job.benefits || "",
            skills: Array.isArray(job.skills) ? job.skills : [],
            experienceLevel: job.experienceLevel || "Mid-level",
            published: job.published !== undefined ? job.published : true,
            expiryDate: job.expiryDate || "",
          });
        } catch (error) {
          console.error("Failed to load job:", error);
          setSubmitError("Failed to load job data");
        } finally {
          setLoading(false);
        }
      };
      loadJob();
    }
  }, [isEditMode, jobId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "employmentTypes") {
      // Handle employment type checkboxes
      const currentTypes = [...formData.employmentTypes];
      if (checked) {
        setFormData((prev) => ({ ...prev, employmentTypes: [...currentTypes, value] }));
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          employmentTypes: currentTypes.filter(t => t !== value) 
        }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    
    // Validate employment types
    if (!formData.employmentTypes || formData.employmentTypes.length === 0) {
      newErrors.employmentTypes = "At least one employment type is required";
    } else {
      const hasFullTime = formData.employmentTypes.some(t => 
        t === "Full-time" || t === "FULL_TIME"
      );
      const hasPartTime = formData.employmentTypes.some(t => 
        t === "Part-time" || t === "PART_TIME"
      );
      if (hasFullTime && hasPartTime) {
        newErrors.employmentTypes = "Cannot be both Full-time and Part-time";
      }
    }
    
    // Validate salary based on type
    if (formData.salaryType === "RANGE") {
      if (!formData.salaryMin || !formData.salaryMax) {
        newErrors.salary = "RANGE requires both min and max values";
      } else if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
        newErrors.salary = "Min salary cannot exceed max salary";
      }
    } else if (formData.salaryType === "FROM" && !formData.salaryMin) {
      newErrors.salary = "FROM requires minimum value";
    } else if (formData.salaryType === "UP_TO" && !formData.salaryMax) {
      newErrors.salary = "UP_TO requires maximum value";
    } else if (formData.salaryType === "ABOUT" && !formData.salaryMin) {
      newErrors.salary = "ABOUT requires a value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitError(null);
      setSubmitting(true);
      try {
        if (isEditMode) {
          await jobService.updateJob(jobId, formData);
        } else {
          await jobService.createJob(formData);
        }
        navigate("/dashboard/post-manager");
      } catch (err) {
        console.error("Submit job failed:", err);
        setSubmitError(
          err.message ||
            `Failed to ${isEditMode ? "update" : "publish"} job post`
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSaveDraft = async () => {
    // Basic validation - only title is required for draft
    if (!formData.title.trim()) {
      setSubmitError("Job title is required to save as draft");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      await jobService.saveDraft(formData, isEditMode ? jobId : null);
      alert("Draft saved successfully!");
      navigate("/dashboard/post-manager");
    } catch (err) {
      console.error("Save draft failed:", err);
      setSubmitError(err.message || "Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">
          {isEditMode ? "Edit Job Post" : "Create Job Post"}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? "Update the job posting details"
            : "Fill in the details to create a new job posting"}
        </p>
        {submitError && (
          <p className="mt-3 text-primary font-bold">{submitError}</p>
        )}
      </div>

      {loading ? (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 font-bold">Loading job data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white border-4 border-black p-6">
                <h2 className="text-2xl font-black uppercase mb-6">
                  Basic Information
                </h2>

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
                        errors.title ? "border-primary" : "border-black"
                      } focus:outline-none focus:border-primary font-semibold`}
                    />
                    {errors.title && (
                      <p className="text-primary text-sm font-bold mt-1">
                        {errors.title}
                      </p>
                    )}
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
                          errors.department ? "border-primary" : "border-black"
                        } focus:outline-none focus:border-primary font-semibold`}
                      />
                      {errors.department && (
                        <p className="text-primary text-sm font-bold mt-1">
                          {errors.department}
                        </p>
                      )}
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
                          errors.location ? "border-primary" : "border-black"
                        } focus:outline-none focus:border-primary font-semibold`}
                      />
                      {errors.location && (
                        <p className="text-primary text-sm font-bold mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Employment Types (Multi-select) */}
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Employment Type <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Full-time", "Part-time", "Internship", "Contract"].map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="employmentTypes"
                            value={type}
                            checked={formData.employmentTypes.includes(type)}
                            onChange={handleChange}
                            className="w-4 h-4 border-2 border-black"
                          />
                          <span className="font-semibold">{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.employmentTypes && (
                      <p className="text-primary text-sm font-bold mt-1">
                        {errors.employmentTypes}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Note: Cannot select both Full-time and Part-time
                    </p>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Experience Level
                    </label>
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

                  {/* Salary Structure */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase">
                      Salary <span className="text-primary">*</span>
                    </label>
                    
                    {/* Salary Type */}
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="RANGE">Range (e.g., $1000 - $2000)</option>
                      <option value="ABOUT">About (e.g., About $1500)</option>
                      <option value="UP_TO">Up to (e.g., Up to $2000)</option>
                      <option value="FROM">From (e.g., From $1000)</option>
                      <option value="NEGOTIABLE">Negotiable</option>
                    </select>
                    
                    {/* Conditional Salary Inputs */}
                    {formData.salaryType !== "NEGOTIABLE" && (
                      <div className="grid grid-cols-3 gap-3">
                        {/* Currency */}
                        <select
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleChange}
                          className="px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                        >
                          <option value="USD">USD</option>
                          <option value="VND">VND</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        
                        {/* Min Value (for RANGE, FROM, ABOUT) */}
                        {(formData.salaryType === "RANGE" || 
                          formData.salaryType === "FROM" || 
                          formData.salaryType === "ABOUT") && (
                          <input
                            type="number"
                            name="salaryMin"
                            value={formData.salaryMin}
                            onChange={handleChange}
                            placeholder={formData.salaryType === "RANGE" ? "Min" : "Amount"}
                            className="px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                          />
                        )}
                        
                        {/* Max Value (for RANGE, UP_TO) */}
                        {(formData.salaryType === "RANGE" || 
                          formData.salaryType === "UP_TO") && (
                          <input
                            type="number"
                            name="salaryMax"
                            value={formData.salaryMax}
                            onChange={handleChange}
                            placeholder="Max"
                            className="px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                          />
                        )}
                      </div>
                    )}
                    
                    {errors.salary && (
                      <p className="text-primary text-sm font-bold">
                        {errors.salary}
                      </p>
                    )}
                  </div>
                  
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white border-4 border-black p-6">
                <h2 className="text-2xl font-black uppercase mb-6">
                  Job Description
                </h2>

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
                        errors.description ? "border-primary" : "border-black"
                      } focus:outline-none focus:border-primary font-semibold resize-none`}
                    />
                    {errors.description && (
                      <p className="text-primary text-sm font-bold mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Responsibilities
                    </label>
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
                    <label className="block text-sm font-bold uppercase mb-2">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={6}
                      placeholder="List job requirements (one per line)..."
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-primary font-semibold resize-none"
                    />
                  </div>

                  {/* Skills Tag Input */}
                  <SkillTagInput
                    skills={formData.skills}
                    onSkillsChange={(newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))}
                    error={errors.skills}
                  />

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">
                      Benefits
                    </label>
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
                  {/* Published Toggle */}
                  <div className="p-4 bg-gray-50 border-2 border-black">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleChange}
                        className="w-5 h-5 border-2 border-black"
                      />
                      <div>
                        <span className="font-bold text-sm uppercase">
                          {formData.published ? "Published" : "Draft"}
                        </span>
                        <p className="text-xs text-gray-600">
                          {formData.published 
                            ? "Visible to applicants" 
                            : "Save as draft (not visible)"}
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors"
                  >
                    {submitting
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                      ? "Update Job Post"
                      : formData.published ? "Publish Job Post" : "Save Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save as Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePreview}
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
                    <span className="font-semibold">
                      Be specific about the role and requirements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-black mr-2">•</span>
                    <span className="font-semibold">
                      Include salary range to attract more applicants
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-black mr-2">•</span>
                    <span className="font-semibold">
                      Highlight benefits and company culture
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-black mr-2">•</span>
                    <span className="font-semibold">
                      Use clear, concise language
                    </span>
                  </li>
                </ul>
              </div>

              {/* Stats */}
              <div className="bg-white border-4 border-black p-6">
                <h3 className="text-xl font-black uppercase mb-4">
                  Your Stats
                </h3>
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
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-5xl w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-white border-b-4 border-black p-6 flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-black uppercase">
                Job Post Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-black transition-colors rounded"
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

            {/* Modal Content - Preview with hidden scrollbar */}
            <div
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="p-8 max-w-4xl mx-auto">
                {/* Job Header Card */}
                <div className="bg-gray-50 border-4 border-black p-8 mb-6">
                  <h1 className="text-4xl font-black uppercase mb-4 text-primary">
                    {formData.title || "Job Title"}
                  </h1>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.department && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏢</span>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-600">
                            Department
                          </p>
                          <p className="font-bold">{formData.department}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-600">
                          Location
                        </p>
                        <p className="font-bold">
                          {formData.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💼</span>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-600">
                          Employment Type
                        </p>
                        <p className="font-bold">
                          {formData.employmentTypes.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-600">
                          Salary
                        </p>
                        <p className="font-bold">
                          {formData.salaryType === "NEGOTIABLE" 
                            ? "Negotiable" 
                            : formData.salaryType === "RANGE"
                            ? `${formData.salaryCurrency} ${formData.salaryMin} - ${formData.salaryMax}`
                            : formData.salaryType === "FROM"
                            ? `From ${formData.salaryCurrency} ${formData.salaryMin}`
                            : formData.salaryType === "UP_TO"
                            ? `Up to ${formData.salaryCurrency} ${formData.salaryMax}`
                            : formData.salaryType === "ABOUT"
                            ? `About ${formData.salaryCurrency} ${formData.salaryMin}`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    {formData.expiryDate && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-600">
                            Expires
                          </p>
                          <p className="font-bold">{formData.expiryDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                {formData.description && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      📋 Job Description
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.description}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {formData.requirements && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      ✅ Requirements
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.requirements}
                    </div>
                  </div>
                )}

                {/* Responsibilities */}
                {formData.responsibilities && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      🎯 Responsibilities
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.responsibilities}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {formData.benefits && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      🎁 Benefits
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.benefits}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {formData.skills && formData.skills.length > 0 && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      🛠️ Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {formData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-primary text-white font-bold border-2 border-black"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Level */}
                {formData.experienceLevel && (
                  <div className="bg-white border-4 border-black p-6 mb-6">
                    <h2 className="text-xl font-black uppercase mb-4 text-primary border-b-2 border-black pb-2">
                      📊 Experience Level
                    </h2>
                    <p className="text-lg font-bold">
                      {formData.experienceLevel}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="border-t-4 border-black p-6 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-6 py-4 bg-black text-white font-black uppercase text-lg hover:bg-gray-800 transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPostPage;
