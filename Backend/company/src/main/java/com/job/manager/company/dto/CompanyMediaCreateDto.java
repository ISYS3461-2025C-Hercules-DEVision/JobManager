package com.job.manager.company.dto;

import com.job.manager.company.entity.CompanyMedia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for creating new media items.
 * 
 * This DTO is used when companies upload new images or videos to their gallery.
 * The typical workflow is:
 * 1. Client uploads file to cloud storage (e.g., Azure Blob Storage)
 * 2. Cloud storage returns a permanent URL
 * 3. Client sends this DTO with the URL to create the database record
 * 
 * Validation rules:
 * - url: Required, must not be blank
 * - mediaType: Required, must be IMAGE or VIDEO
 * - title, description: Optional metadata
 * - orderIndex: Optional, auto-assigned if null
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMediaCreateDto {

    /**
     * The permanent URL where the media file is stored.
     * Typically a cloud storage URL (e.g., https://storage.azure.com/media/image123.jpg)
     * 
     * This field is validated to ensure it's not null, empty, or only whitespace.
     */
    @NotBlank(message = "URL is required")
    private String url;

    /**
     * The type of media being uploaded.
     * Must be one of the predefined enum values:
     * - IMAGE: For photos, screenshots, infographics
     * - VIDEO: For promotional videos, office tours, team introductions
     * 
     * This field is required and cannot be null.
     */
    @NotNull(message = "Media type is required")
    private CompanyMedia.MediaType mediaType;

    /**
     * Optional display title for the media.
     * Examples: "Office Tour", "Team Building Event", "Our Workspace"
     * 
     * Can be null or empty. If not provided, the UI might display
     * just the image/video without a title.
     */
    private String title;

    /**
     * Optional description or caption for the media.
     * Provides additional context about what the media shows.
     * 
     * Can be null or empty. Useful for accessibility and SEO.
     */
    private String description;

    /**
     * Optional display order in the gallery.
     * Lower numbers appear first (0, 1, 2, ...).
     * 
     * If null, the service automatically assigns the next available index,
     * effectively appending the media to the end of the gallery.
     */
    private Integer orderIndex;
}
