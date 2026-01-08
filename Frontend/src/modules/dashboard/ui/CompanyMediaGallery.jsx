import React, { useState, useEffect } from "react";
import { useApp } from "../../../state/AppContext";
import * as mediaService from "../services/companyMediaService";

/**
 * CompanyMediaGallery Component
 * Manages company media gallery (images and videos)
 * Features:
 * - Upload images and videos
 * - View all media in grid layout
 * - Edit media metadata (title, description)
 * - Toggle media visibility (active/inactive)
 * - Delete media
 * - Drag-and-drop reordering
 * - Media type filtering
 */
function CompanyMediaGallery() {
  const { showSuccess, showError } = useApp();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, IMAGE, VIDEO
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState("IMAGE");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadPreview, setUploadPreview] = useState(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getAllMedia();
      setMedia(data);
    } catch (error) {
      showError(error.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showError("Only image and video files are allowed");
      return;
    }

    setUploadFile(file);
    setUploadType(isImage ? "IMAGE" : "VIDEO");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      showError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      await mediaService.uploadMedia(
        uploadFile,
        uploadType,
        uploadTitle,
        uploadDescription
      );
      showSuccess("Media uploaded successfully");
      setShowUploadModal(false);
      resetUploadForm();
      await loadMedia();
    } catch (error) {
      showError(error.message || "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadType("IMAGE");
    setUploadTitle("");
    setUploadDescription("");
    setUploadPreview(null);
  };

  const openEditModal = (item) => {
    setSelectedMedia(item);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditIsActive(item.isActive);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await mediaService.updateMedia(selectedMedia.mediaId, {
        title: editTitle,
        description: editDescription,
        isActive: editIsActive,
      });
      showSuccess("Media updated successfully");
      setShowEditModal(false);
      await loadMedia();
    } catch (error) {
      showError(error.message || "Failed to update media");
    }
  };

  const handleDelete = async () => {
    try {
      await mediaService.deleteMedia(selectedMedia.mediaId);
      showSuccess("Media deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedMedia(null);
      await loadMedia();
    } catch (error) {
      showError(error.message || "Failed to delete media");
    }
  };

  const toggleVisibility = async (item) => {
    try {
      await mediaService.updateMedia(item.mediaId, {
        ...item,
        isActive: !item.isActive,
      });
      showSuccess(`Media ${item.isActive ? "hidden" : "published"}`);
      await loadMedia();
    } catch (error) {
      showError(error.message || "Failed to update media visibility");
    }
  };

  const filteredMedia =
    filter === "ALL"
      ? media
      : media.filter((item) => item.mediaType === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-semibold">Loading media...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black">
        <div className="bg-gray-800 text-white p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase">Media Gallery</h2>
              <p className="font-semibold mt-1">
                Manage your company images and videos
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-white transition-colors"
            >
              + Upload Media
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-6 border-b-4 border-black flex space-x-4">
          {["ALL", "IMAGE", "VIDEO"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 font-bold uppercase border-2 border-black transition-colors ${
                filter === type
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {type} (
              {type === "ALL"
                ? media.length
                : media.filter((m) => m.mediaType === type).length}
              )
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 font-semibold text-lg">
                No media found
              </p>
              <p className="text-gray-500 mt-2">
                Upload images and videos to showcase your company
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => (
                <div
                  key={item.mediaId}
                  className="border-4 border-black bg-white relative group"
                >
                  {/* Media Preview */}
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {item.mediaType === "IMAGE" ? (
                      <img
                        src={item.url}
                        alt={item.title || "Company media"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase ${
                          item.isActive ? "bg-green-500" : "bg-gray-500"
                        } text-white`}
                      >
                        {item.isActive ? "Published" : "Hidden"}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-3 py-1 text-xs font-bold uppercase bg-black text-white">
                        {item.mediaType}
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-4 py-2 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleVisibility(item)}
                          className="px-4 py-2 bg-primary text-white font-bold uppercase border-2 border-black hover:bg-primary-hover"
                          title={item.isActive ? "Hide" : "Publish"}
                        >
                          {item.isActive ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMedia(item);
                            setShowDeleteConfirm(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white font-bold uppercase border-2 border-black hover:bg-red-600"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-4 border-t-4 border-black">
                    <h3 className="font-black uppercase text-lg mb-1">
                      {item.title || "Untitled"}
                    </h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm font-semibold line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-semibold mt-2">
                      Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-primary text-white p-6 border-b-4 border-black flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase">Upload Media</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
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

            <div className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block font-bold uppercase mb-2">Select File *</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="w-full border-2 border-black p-2 font-semibold"
                />
                <p className="text-sm text-gray-600 font-semibold mt-2">
                  Max size: 10MB • Accepted: JPG, PNG, GIF, WebP, MP4, WebM, MOV
                </p>
              </div>

              {/* Media Type Selection */}
              <div>
                <label className="block font-bold uppercase mb-2">Media Type *</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setUploadType("IMAGE")}
                    className={`flex-1 px-4 py-2 font-bold uppercase border-2 border-black ${
                      uploadType === "IMAGE" ? "bg-primary text-white" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setUploadType("VIDEO")}
                    className={`flex-1 px-4 py-2 font-bold uppercase border-2 border-black ${
                      uploadType === "VIDEO" ? "bg-primary text-white" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {/* Preview */}
              {uploadPreview && (
                <div className="border-4 border-black">
                  <div className="aspect-video bg-gray-200">
                    {uploadType === "IMAGE" ? (
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        src={uploadPreview}
                        className="w-full h-full object-contain"
                        controls
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold uppercase mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title for this media"
                  className="w-full border-2 border-black p-3 font-semibold"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Enter a description"
                  rows={3}
                  className="w-full border-2 border-black p-3 font-semibold"
                  maxLength={500}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile}
                  className={`flex-1 px-6 py-3 font-bold uppercase border-2 border-black transition-colors ${
                    uploading || !uploadFile
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-primary hover:bg-primary-hover text-white"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="px-6 py-3 bg-white border-2 border-black font-bold uppercase hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-2xl w-full">
            <div className="bg-primary text-white p-6 border-b-4 border-black flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase">Edit Media</h2>
              <button onClick={() => setShowEditModal(false)}>
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

            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="border-4 border-black">
                <div className="aspect-video bg-gray-200">
                  {selectedMedia.mediaType === "IMAGE" ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      className="w-full h-full object-contain"
                      controls
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border-2 border-black p-3 font-semibold"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-black p-3 font-semibold"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-5 h-5 border-2 border-black"
                  />
                  <span className="font-bold uppercase">
                    Published (Visible to public)
                  </span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-white border-2 border-black font-bold uppercase hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full">
            <div className="bg-red-500 text-white p-6 border-b-4 border-black">
              <h2 className="text-2xl font-black uppercase">Delete Media?</h2>
            </div>

            <div className="p-6">
              <p className="font-semibold text-gray-700 mb-4">
                Are you sure you want to delete this media? This action cannot
                be undone.
              </p>

              <div className="border-4 border-black mb-4">
                <div className="aspect-video bg-gray-200">
                  {selectedMedia.mediaType === "IMAGE" ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold uppercase border-2 border-black"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedMedia(null);
                  }}
                  className="px-6 py-3 bg-white border-2 border-black font-bold uppercase hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyMediaGallery;
