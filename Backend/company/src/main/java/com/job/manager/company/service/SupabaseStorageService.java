package com.job.manager.company.service;

import com.job.manager.company.config.SupabaseConfig;
import com.job.manager.company.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

/**
 * Service for handling file uploads to Supabase Storage.
 * 
 * This service manages the entire lifecycle of uploading media files
 * to Supabase Storage and generating public URLs for access.
 * 
 * Key features:
 * - Uploads files to Supabase Storage bucket
 * - Generates unique file names to prevent collisions
 * - Validates file types (images and videos only)
 * - Returns public URLs for accessing uploaded files
 * - Handles error cases and cleanup
 * 
 * Supported file types:
 * - Images: JPEG, PNG, GIF, WebP
 * - Videos: MP4, WebM, MOV
 */
@Service
@Slf4j
public class SupabaseStorageService {

    @Autowired
    private SupabaseConfig supabaseConfig;

    @Autowired
    private OkHttpClient httpClient;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    // Allowed content types
    private static final String[] ALLOWED_IMAGE_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };
    
    private static final String[] ALLOWED_VIDEO_TYPES = {
        "video/mp4", "video/webm", "video/quicktime"
    };

    /**
     * Uploads a file to Supabase Storage and returns the public URL.
     * 
     * The file is stored with a unique name in the format:
     * {companyId}/{timestamp}_{uuid}_{originalFileName}
     * 
     * For example: "comp-123/20260107_145030_a1b2c3d4_company_logo.png"
     * 
     * This naming strategy:
     * - Organizes files by company
     * - Ensures uniqueness with timestamp and UUID
     * - Preserves original filename for debugging
     * - Prevents filename collisions
     * 
     * @param file The file to upload (MultipartFile from Spring)
     * @param companyId The company ID (for organizing files)
     * @param mediaType The type of media (IMAGE or VIDEO)
     * @return The public URL where the file can be accessed
     * @throws BusinessException if upload fails or file is invalid
     */
    public String uploadFile(MultipartFile file, String companyId, String mediaType) {
        // Check if Supabase is configured
        if (supabaseConfig.getSupabaseUrl() == null || supabaseConfig.getSupabaseUrl().contains("{")) {
            log.warn("Supabase storage is not configured. Using mock URL for development.");
            // Return a mock URL for development
            String mockFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            return "https://mock-storage.example.com/company-media/" + companyId + "/" + mockFileName;
        }
        
        // Validate file
        validateFile(file, mediaType);
        
        // Generate unique filename
        String fileName = generateFileName(companyId, file.getOriginalFilename(), mediaType);
        
        // Upload to Supabase
        try {
            String publicUrl = uploadToSupabase(fileName, file);
            log.info("Successfully uploaded file: {} for company: {}", fileName, companyId);
            return publicUrl;
        } catch (IOException e) {
            log.error("Failed to upload file to Supabase: {}", e.getMessage());
            throw new BusinessException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Validates the uploaded file.
     * 
     * Checks:
     * - File is not null or empty
     * - File size doesn't exceed limit
     * - Content type matches the media type
     * 
     * @param file The file to validate
     * @param mediaType The expected media type (IMAGE or VIDEO)
     * @throws BusinessException if validation fails
     */
    private void validateFile(MultipartFile file, String mediaType) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BusinessException("Unable to determine file type");
        }

        boolean isValid = false;
        if ("IMAGE".equals(mediaType)) {
            for (String allowedType : ALLOWED_IMAGE_TYPES) {
                if (contentType.equals(allowedType)) {
                    isValid = true;
                    break;
                }
            }
            if (!isValid) {
                throw new BusinessException("Invalid image type. Allowed: JPEG, PNG, GIF, WebP");
            }
        } else if ("VIDEO".equals(mediaType)) {
            for (String allowedType : ALLOWED_VIDEO_TYPES) {
                if (contentType.equals(allowedType)) {
                    isValid = true;
                    break;
                }
            }
            if (!isValid) {
                throw new BusinessException("Invalid video type. Allowed: MP4, WebM, MOV");
            }
        }
    }

    /**
     * Generates a unique filename with company organization.
     * 
     * Format: {companyId}/{mediaType}/{timestamp}_{uuid}_{originalFileName}
     * 
     * @param companyId The company ID
     * @param originalFileName The original uploaded filename
     * @return A unique filename path
     */
    private String generateFileName(String companyId, String originalFileName, String mediaType) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        // Sanitize original filename (remove special characters)
        String sanitized = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        
        // Organize by media type folder (images/ or videos/)
        String folder = mediaType.toLowerCase() + "s"; // IMAGE -> images, VIDEO -> videos
        
        return String.format("%s/%s/%s_%s_%s", companyId, folder, timestamp, uuid, sanitized);
    }

    /**
     * Uploads file to Supabase Storage using REST API.
     * 
     * Makes a POST request to:
     * POST {supabaseUrl}/storage/v1/object/{bucketName}/{fileName}
     * 
     * Headers:
     * - Authorization: Bearer {apiKey}
     * - Content-Type: {file's content type}
     * 
     * @param fileName The destination filename in the bucket
     * @param file The file to upload
     * @return The public URL of the uploaded file
     * @throws IOException if upload fails
     */
    private String uploadToSupabase(String fileName, MultipartFile file) throws IOException {
        String uploadUrl = supabaseConfig.getStorageUrl() + "/" + fileName;
        
        RequestBody requestBody = RequestBody.create(
            file.getBytes(),
            MediaType.parse(Objects.requireNonNull(file.getContentType()))
        );

        Request request = new Request.Builder()
                .url(uploadUrl)
                .addHeader("Authorization", "Bearer " + supabaseConfig.getApiKey())
                .addHeader("Content-Type", file.getContentType())
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Supabase upload failed. Status: {}, Body: {}", response.code(), errorBody);
                throw new IOException("Upload failed with status: " + response.code() + ", Error: " + errorBody);
            }
            
            // Return the public URL
            return supabaseConfig.getPublicUrl() + "/" + fileName;
        }
    }

    /**
     * Deletes a file from Supabase Storage.
     * 
     * Extracts the file path from the public URL and deletes it.
     * 
     * @param publicUrl The public URL of the file to delete
     * @return true if deletion was successful, false otherwise
     */
    public boolean deleteFile(String publicUrl) {
        try {
            // Extract file path from public URL
            String publicUrlPrefix = supabaseConfig.getPublicUrl() + "/";
            if (!publicUrl.startsWith(publicUrlPrefix)) {
                log.warn("URL doesn't match Supabase bucket: {}", publicUrl);
                return false;
            }
            
            String filePath = publicUrl.substring(publicUrlPrefix.length());
            String deleteUrl = supabaseConfig.getStorageUrl() + "/" + filePath;
            
            Request request = new Request.Builder()
                    .url(deleteUrl)
                    .addHeader("Authorization", "Bearer " + supabaseConfig.getApiKey())
                    .delete()
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("Successfully deleted file: {}", filePath);
                    return true;
                } else {
                    log.error("Failed to delete file. Status: {}", response.code());
                    return false;
                }
            }
        } catch (Exception e) {
            log.error("Error deleting file from Supabase: {}", e.getMessage());
            return false;
        }
    }
}
