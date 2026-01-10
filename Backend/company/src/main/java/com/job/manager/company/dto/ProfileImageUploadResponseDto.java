package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for profile image uploads (logo and banner).
 * 
 * This DTO is returned after successfully uploading a logo or banner image
 * to Supabase Storage and updating the company's public profile.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileImageUploadResponseDto {

    /**
     * The public URL where the uploaded image can be accessed.
     * This URL is automatically saved in the company's public profile.
     */
    private String imageUrl;

    /**
     * The type of profile image uploaded.
     * Values: "LOGO" or "BANNER"
     */
    private String imageType;

    /**
     * The generated filename in Supabase Storage.
     */
    private String fileName;

    /**
     * The size of the uploaded file in bytes.
     */
    private Long fileSize;

    /**
     * The content type of the uploaded file.
     * Examples: image/jpeg, image/png, image/webp
     */
    private String contentType;

    /**
     * Success message.
     */
    private String message;
}
