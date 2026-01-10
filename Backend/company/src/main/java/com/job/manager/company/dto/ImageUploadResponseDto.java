package com.job.manager.company.dto;

import com.job.manager.company.entity.CompanyMedia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for file upload operations to Supabase.
 * 
 * This DTO is returned after successfully uploading a file to Supabase Storage.
 * It contains the public URL where the file can be accessed and metadata
 * about the uploaded media.
 * 
 * The public URL can be used directly in frontend applications to display
 * images or embed videos. For example:
 * <img src="{publicUrl}" alt="Company media" />
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ImageUploadResponseDto {

    /**
     * The public URL where the uploaded file can be accessed.
     * 
     * Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
     * Example: https://abc123.supabase.co/storage/v1/object/public/company-media/comp-123/20260107_145030_a1b2c3d4_logo.png
     * 
     * This URL can be used directly in:
     * - HTML img tags
     * - CSS background-image properties
     * - Video player sources
     * - API responses to frontend
     */
    private String publicUrl;

    /**
     * The generated unique filename in the storage bucket.
     * Format: {companyId}/{timestamp}_{uuid}_{originalFileName}
     */
    private String fileName;

    /**
     * The type of media that was uploaded.
     */
    private CompanyMedia.MediaType mediaType;

    /**
     * The size of the uploaded file in bytes.
     */
    private Long fileSize;

    /**
     * The original filename that was uploaded.
     */
    private String originalFileName;

    /**
     * The content type of the uploaded file.
     * Examples: image/jpeg, image/png, video/mp4
     */
    private String contentType;

    /**
     * The ID of the created CompanyMedia record in the database.
     * This can be used for future updates or deletions.
     */
    private String mediaId;

    /**
     * Message indicating successful upload.
     */
    private String message;
}
