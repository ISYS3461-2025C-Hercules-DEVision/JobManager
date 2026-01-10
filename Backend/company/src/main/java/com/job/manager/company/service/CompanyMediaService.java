package com.job.manager.company.service;

import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.repository.CompanyMediaRepository;
import com.job.manager.company.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for managing company media gallery (images and videos).
 * 
 * This service handles the business logic for company media management, including:
 * - Enforcing a maximum of 10 media items per company to prevent abuse
 * - Managing display order for media gallery presentation
 * - Controlling media visibility through active/inactive status
 * - Ensuring data integrity through ownership verification
 * 
 * The media feature allows companies to showcase their workspace, team,
 * and company culture to potential job applicants.
 */
@Service
public class CompanyMediaService {

    @Autowired
    private CompanyMediaRepository mediaRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    /**
     * Maximum number of media items allowed per company.
     * This limit prevents excessive storage usage and ensures reasonable page load times.
     * Companies should curate their best 10 images/videos rather than uploading everything.
     */
    private static final int MAX_MEDIA_PER_COMPANY = 10;

    /**
     * Adds a new media item to a company's gallery.
     * 
     * This method performs several validations:
     * 1. Verifies the company exists in the database
     * 2. Checks that the company hasn't exceeded the 10-media limit
     * 3. Auto-assigns display order if not specified
     * 
     * The method uses @Transactional to ensure atomicity - either the media
     * is fully saved or the operation fails completely, preventing partial saves.
     * 
     * @param companyId The unique identifier of the company
     * @param url The URL where the media file is stored (e.g., Azure Blob Storage URL)
     * @param mediaType Type of media (IMAGE or VIDEO)
     * @param title Optional title for the media (can be null)
     * @param description Optional description (can be null)
     * @param orderIndex Display order in gallery (null = append to end)
     * @return The saved CompanyMedia entity with generated ID and timestamp
     * @throws BusinessException if company doesn't exist or media limit exceeded
     */
    @Transactional
    public CompanyMedia addMedia(String companyId, String url, CompanyMedia.MediaType mediaType, 
                                 String title, String description, Integer orderIndex) {
        // Verify company exists
        if (!companyRepository.existsById(companyId)) {
            throw new BusinessException("Company not found");
        }

        // Check media count limit to prevent excessive uploads
        // This protects both storage costs and user experience (slow page loads)
        long currentCount = mediaRepository.countByCompanyId(companyId);
        if (currentCount >= MAX_MEDIA_PER_COMPANY) {
            throw new BusinessException("Maximum media limit reached (" + MAX_MEDIA_PER_COMPANY + ")");
        }

        // Auto-assign order index if not provided by client
        // New media items are appended to the end of the gallery by default
        if (orderIndex == null) {
            orderIndex = (int) currentCount;
        }

        CompanyMedia media = CompanyMedia.builder()
                .mediaId(UUID.randomUUID().toString())
                .companyId(companyId)
                .url(url)
                .mediaType(mediaType)
                .title(title)
                .description(description)
                .orderIndex(orderIndex)
                .isActive(true)
                .uploadedAt(LocalDateTime.now())
                .build();

        return mediaRepository.save(media);
    }

    /**
     * Retrieves all media items for a company, ordered by display sequence.
     * This is used for company admin pages where they manage their gallery.
     * 
     * @param companyId The company's unique identifier
     * @return List of media items sorted by orderIndex (0, 1, 2, etc.)
     */
    public List<CompanyMedia> getMediaByCompany(String companyId) {
        return mediaRepository.findByCompanyIdOrderByOrderIndexAsc(companyId);
    }

    /**
     * Retrieves only active (published) media for a company.
     * This is used for public-facing job listings where only approved
     * media should be visible to applicants.
     * 
     * @param companyId The company's unique identifier
     * @return List of active media items sorted by display order
     */
    public List<CompanyMedia> getActiveMediaByCompany(String companyId) {
        return mediaRepository.findByCompanyIdAndIsActive(companyId, true);
    }

    /**
     * Filters media by type (images vs videos).
     * Useful for separate image galleries and video sections in the UI.
     * 
     * @param companyId The company's unique identifier
     * @param mediaType Either IMAGE or VIDEO
     * @return List of media items matching the specified type
     */
    public List<CompanyMedia> getMediaByType(String companyId, CompanyMedia.MediaType mediaType) {
        return mediaRepository.findByCompanyIdAndMediaType(companyId, mediaType);
    }

    /**
     * Updates metadata for an existing media item.
     * All parameters are optional - only provided fields are updated.
     * 
     * Common use cases:
     * - Updating title/description for better context
     * - Toggling isActive to publish/unpublish media
     * - Changing orderIndex to reorder the gallery (though reorderMedia is preferred)
     * 
     * @param mediaId The unique identifier of the media to update
     * @param title New title (null = no change)
     * @param description New description (null = no change)
     * @param orderIndex New display order (null = no change)
     * @param isActive New visibility status (null = no change)
     * @return The updated CompanyMedia entity
     * @throws BusinessException if media doesn't exist
     */
    @Transactional
    public CompanyMedia updateMedia(String mediaId, String title, String description, 
                                   Integer orderIndex, Boolean isActive) {
        CompanyMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException("Media not found"));

        if (title != null) media.setTitle(title);
        if (description != null) media.setDescription(description);
        if (orderIndex != null) media.setOrderIndex(orderIndex);
        if (isActive != null) media.setIsActive(isActive);

        return mediaRepository.save(media);
    }

    /**
     * Deletes a media item from a company's gallery.
     * 
     * Security: This method verifies ownership before deletion to prevent
     * malicious users from deleting other companies' media.
     * 
     * This method also deletes the actual file from Supabase Storage
     * to prevent orphaned files and save storage costs.
     * 
     * @param mediaId The unique identifier of the media to delete
     * @param companyId The company ID from the authenticated user's JWT token
     * @throws BusinessException if media doesn't exist or doesn't belong to the company
     */
    @Transactional
    public void deleteMedia(String mediaId, String companyId) {
        CompanyMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException("Media not found"));

        // Critical security check: ensure the authenticated company owns this media
        if (!media.getCompanyId().equals(companyId)) {
            throw new BusinessException("Unauthorized: Media does not belong to this company");
        }

        // Delete file from Supabase Storage
        supabaseStorageService.deleteFile(media.getUrl());
        
        // Delete database record
        mediaRepository.deleteById(mediaId);
    }

    /**
     * Deletes all media for a company.
     * This is typically called when a company account is deleted
     * to ensure proper cleanup and prevent orphaned media records.
     * 
     * This method also deletes all files from Supabase Storage.
     * 
     * @param companyId The company whose media should be deleted
     */
    @Transactional
    public void deleteAllMediaByCompany(String companyId) {
        // Get all media to delete files from storage
        List<CompanyMedia> mediaList = mediaRepository.findByCompanyId(companyId);
        
        // Delete each file from Supabase Storage
        for (CompanyMedia media : mediaList) {
            supabaseStorageService.deleteFile(media.getUrl());
        }
        
        // Delete all database records
        mediaRepository.deleteByCompanyId(companyId);
    }

    /**
     * Reorders the entire media gallery in one atomic operation.
     * 
     * The client sends an ordered list of media IDs representing the desired
     * sequence. This method assigns orderIndex values (0, 1, 2...) accordingly.
     * 
     * Example: If mediaIds = ["id3", "id1", "id2"], the result will be:
     * - id3: orderIndex = 0 (displayed first)
     * - id1: orderIndex = 1
     * - id2: orderIndex = 2 (displayed last)
     * 
     * Security: Verifies each media item belongs to the company before reordering.
     * 
     * @param companyId The company ID from the authenticated user
     * @param mediaIds Ordered list of media IDs in desired display sequence
     * @throws BusinessException if any media doesn't exist or belong to the company
     */
    @Transactional
    public void reorderMedia(String companyId, List<String> mediaIds) {
        for (int i = 0; i < mediaIds.size(); i++) {
            String mediaId = mediaIds.get(i);
            CompanyMedia media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> new BusinessException("Media not found: " + mediaId));

            if (!media.getCompanyId().equals(companyId)) {
                throw new BusinessException("Unauthorized: Media does not belong to this company");
            }

            media.setOrderIndex(i);
            mediaRepository.save(media);
        }
    }

    /**
     * Returns the current number of media items for a company.
     * Useful for showing "5 / 10 media uploaded" progress indicators
     * and for client-side validation before attempting uploads.
     * 
     * @param companyId The company's unique identifier
     * @return Count of media items (both active and inactive)
     */
    public long getMediaCount(String companyId) {
        return mediaRepository.countByCompanyId(companyId);
    }
}
