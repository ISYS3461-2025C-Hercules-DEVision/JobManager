import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobService } from "../services/jobService";

/**
 * PostManagerPage - Manage all job posts
 * Features: List view, status filters, edit/delete actions
 *
 * Job Post Statuses:
 * - Active: Published job accepting applications
 * - Closed: Job no longer accepting applications (expired or manually closed)
 * - Draft: Job created but not yet published
 *
 * Bulk Actions:
 * - Activate: Publish and make jobs active (accepting applications)
 * - Close: Stop accepting applications without deleting (keeps data for records)
 * - Delete: Permanently remove job posts from database
 */
function PostManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Sort states
  const [sortBy, setSortBy] = useState("postedDate"); // default sort by posted date
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first

  useEffect(() => {
    const load = async () => {
      try {
        const data = await jobService.listMyJobs();
        const today = new Date();

        const mapped = data.map((j) => {
          const expiry = j.expiryDate ? new Date(j.expiryDate) : null;
          let status = j.published ? "Active" : "Draft";
          if (j.published && expiry && expiry < today) status = "Closed";

          // Handle both old (employmentType) and new (employmentTypes array) structures
          let employmentType = "-";
          if (Array.isArray(j.employmentTypes) && j.employmentTypes.length > 0) {
            // New structure: array of types
            employmentType = j.employmentTypes.join(", ");
          } else if (j.employmentType) {
            // Old structure: single string
            employmentType = j.employmentType;
          }

          return {
            id: j.id,
            title: j.title,
            department: j.department || "-",
            location: j.location || "-",
            type: employmentType,
            status,
            applicants: 0,
            views: 0,
            postedDate: j.postedDate || null,
            expiryDate: j.expiryDate || null,
            skills: Array.isArray(j.skills) ? j.skills : [], // Include skills array
          };
        });

        setJobPosts(mapped);
      } catch (error) {
        console.error("Failed to load job posts:", error);
        setJobPosts([]);
      }
    };

    load();
  }, []);

  const handleEdit = (jobId) => {
    navigate(`/dashboard/job-post?id=${jobId}`);
  };

  const confirmDelete = (jobId) => {
    setDeleteJobId(jobId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await jobService.deleteJob(deleteJobId);
      setJobPosts((prev) => prev.filter((job) => job.id !== deleteJobId));
      setShowDeleteDialog(false);
      setDeleteJobId(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let posts = jobPosts;

    // Filter by status tab
    if (activeTab === "active")
      posts = posts.filter((post) => post.status === "Active");
    else if (activeTab === "closed")
      posts = posts.filter((post) => post.status === "Closed");
    else if (activeTab === "draft")
      posts = posts.filter((post) => post.status === "Draft");

    // Filter by search query (title or location)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.location.toLowerCase().includes(query)
      );
    }

    // Filter by department
    if (filterDepartment) {
      posts = posts.filter((post) => post.department === filterDepartment);
    }

    // Filter by employment type
    if (filterType) {
      posts = posts.filter((post) => post.type === filterType);
    }

    // Filter by location
    if (filterLocation) {
      posts = posts.filter((post) => post.location === filterLocation);
    }

    // Sort posts
    posts.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "title":
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case "department":
          compareA = a.department.toLowerCase();
          compareB = b.department.toLowerCase();
          break;
        case "status":
          compareA = a.status;
          compareB = b.status;
          break;
        case "applicants":
          compareA = a.applicants;
          compareB = b.applicants;
          break;
        case "views":
          compareA = a.views;
          compareB = b.views;
          break;
        case "postedDate":
          compareA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          compareB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return posts;
  }, [
    jobPosts,
    activeTab,
    searchQuery,
    filterDepartment,
    filterType,
    filterLocation,
    sortBy,
    sortOrder,
  ]);

  // Get unique values for filters
  const uniqueDepartments = useMemo(
    () => [
      ...new Set(jobPosts.map((j) => j.department).filter((d) => d !== "-")),
    ],
    [jobPosts]
  );
  const uniqueTypes = useMemo(
    () => [...new Set(jobPosts.map((j) => j.type).filter((t) => t !== "-"))],
    [jobPosts]
  );
  const uniqueLocations = useMemo(
    () => [
      ...new Set(jobPosts.map((j) => j.location).filter((l) => l !== "-")),
    ],
    [jobPosts]
  );

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDepartment("");
    setFilterType("");
    setFilterLocation("");
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1 inline-block">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const toggleSelectPost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) return;

    const confirmMessage =
      action === "delete"
        ? `Are you sure you want to delete ${selectedPosts.length} job post(s)?`
        : action === "activate"
        ? `Activate ${selectedPosts.length} job post(s)?`
        : `Close ${selectedPosts.length} job post(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === "activate") {
        await jobService.bulkActivate(selectedPosts);
        // Update local state
        setJobPosts((prev) =>
          prev.map((job) =>
            selectedPosts.includes(job.id) ? { ...job, status: "Active" } : job
          )
        );
      } else if (action === "close") {
        await jobService.bulkClose(selectedPosts);
        // Update local state
        setJobPosts((prev) =>
          prev.map((job) =>
            selectedPosts.includes(job.id) ? { ...job, status: "Closed" } : job
          )
        );
      } else if (action === "delete") {
        await jobService.bulkDelete(selectedPosts);
        // Remove deleted jobs from local state
        setJobPosts((prev) =>
          prev.filter((job) => !selectedPosts.includes(job.id))
        );
      }

      setSelectedPosts([]);
      alert(
        `Successfully ${
          action === "activate"
            ? "activated"
            : action === "close"
            ? "closed"
            : "deleted"
        } ${selectedPosts.length} job post(s)`
      );
    } catch (error) {
      console.error(`Failed to ${action} jobs:`, error);
      alert(`Failed to ${action} job posts. Please try again.`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase mb-2">Post Manager</h1>
        <p className="text-gray-600">Manage and track all your job postings</p>
      </div>

      {/* Tabs */}
      <div className="border-b-4 border-black mb-6">
        <div className="flex space-x-2">
          {[
            { key: "all", label: "All Posts" },
            { key: "active", label: "Active" },
            { key: "closed", label: "Closed" },
            { key: "draft", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-black uppercase text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-4 border-black p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold uppercase mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || filterDepartment || filterType || filterLocation) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 border-2 border-black font-bold uppercase text-sm hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm font-bold text-gray-600">
        Showing {filteredPosts.length} of {jobPosts.length} job posts
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="bg-primary text-white border-4 border-black p-4 mb-6 flex items-center justify-between">
          <span className="font-bold">
            {selectedPosts.length} post{selectedPosts.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("close")}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white border-4 border-black">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-4 border-black bg-gray-100">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={
                      selectedPosts.length > 0 &&
                      selectedPosts.length === filteredPosts.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(filteredPosts.map((p) => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  Job Title <SortIcon column="title" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("department")}
                >
                  Department <SortIcon column="department" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Skills
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon column="status" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("applicants")}
                >
                  Applicants <SortIcon column="applicants" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("views")}
                >
                  Views <SortIcon column="views" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-black uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("postedDate")}
                >
                  Posted <SortIcon column="postedDate" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b-2 border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => toggleSelectPost(post.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{post.title}</div>
                    <div className="text-sm text-gray-600">{post.location}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{post.department}</td>
                  <td className="px-6 py-4 text-sm">{post.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {post.skills && post.skills.length > 0 ? (
                        <>
                          {post.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs font-bold bg-primary text-white border border-black"
                            >
                              {skill}
                            </span>
                          ))}
                          {post.skills.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-gray-200 text-gray-700 border border-gray-400">
                              +{post.skills.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                        post.status === "Active"
                          ? "bg-green-100 text-green-800 border-green-800"
                          : post.status === "Closed"
                          ? "bg-red-100 text-red-800 border-red-800"
                          : "bg-yellow-100 text-yellow-800 border-yellow-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">
                    {post.applicants}
                  </td>
                  <td className="px-6 py-4 text-center">{post.views}</td>
                  <td className="px-6 py-4 text-sm">
                    {post.postedDate || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/post-manager/view?id=${post.id}`)
                        }
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(post.id)}
                        className="p-2 border-2 border-black hover:bg-primary hover:border-primary hover:text-white transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-black uppercase mb-2">
              No posts found
            </h3>
            <p className="text-gray-600">
              Create your first job post to get started
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-black uppercase mb-4">
              Delete Job Post?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job post? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-primary text-white font-bold uppercase border-2 border-black hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteJobId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostManagerPage;
