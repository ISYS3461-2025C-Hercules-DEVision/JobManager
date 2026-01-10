package com.job.manager.company.controller;

import com.job.manager.company.annotation.CurrentUser;
import com.job.manager.company.dto.*;
import com.job.manager.company.entity.Company;
import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.service.CompanyMediaService;
import com.job.manager.company.service.CompanyService;
import com.job.manager.company.service.SupabaseStorageService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API controller for managing company media gallery.
 * 
 * This controller handles all media-related operations for authenticated companies.
 * All endpoints require JWT authentication - the @CurrentUser annotation extracts
 * the authenticated company's information from the JWT token.
 * 
 * Authentication flow:
 * 1. Client includes JWT in Authorization header: "Bearer <token>"
 * 2. Kong API Gateway validates the JWT signature
 * 3. Request reaches this controller with validated JWT
 * 4. @CurrentUser resolver parses JWT to extract user email
 * 5. Controller looks up company by email for authorization
 * 
 * Base path: /media (will be /company/media through Kong with strip_path)
 * 
 * Available operations:
 * - POST /media - Upload new image or video
 * - GET /media - List all media (for admin dashboard)
 * - GET /media/active - List published media (for public profile)
 * - GET /media/type/{IMAGE|VIDEO} - Filter by media type
 * - PUT /media/{id} - Update media metadata
 * - DELETE /media/{id} - Remove media from gallery
 * - PUT /media/reorder - Reorder gallery display sequence
 * - GET /media/count - Check current media count (for upload limits)
 */
@Slf4j
@RestController
@RequestMapping("/media")
public class CompanyMediaController {

    @Autowired
    private CompanyMediaService mediaService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    /**
     * Adds a new media item to the company's gallery.
     * 
     * The client should first upload the actual file to cloud storage
     * (e.g., Azure Blob Storage) and then call this endpoint with the resulting URL.
     * 
     * Validations:
     * - URL is required and cannot be blank
     * - mediaType must be either IMAGE or VIDEO
     * - Company cannot exceed 10 media items
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param requestDto Media details including URL, type, title, description
     * @return HTTP 201 Created with the saved media details including generated ID
     */
    @PostMapping
    public ResponseEntity<CompanyMediaResponseDto> addMedia(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody CompanyMediaCreateDto requestDto) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        
        CompanyMedia media = mediaService.addMedia(
                company.getCompanyId(),
                requestDto.getUrl(),
                requestDto.getMediaType(),
                requestDto.getTitle(),
                requestDto.getDescription(),
                requestDto.getOrderIndex()
        );
        
        CompanyMediaResponseDto response = mapToMediaResponse(media);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Uploads a file directly to Supabase Storage and creates a media record.
     * 
     * This is an all-in-one endpoint that:
     * 1. Validates the uploaded file
     * 2. Uploads it to Supabase Storage
     * 3. Creates a database record with the resulting URL
     * 
     * Unlike the /media POST endpoint which requires pre-uploading to storage,
     * this endpoint handles the entire upload process in one request.
     * 
     * File upload constraints:
     * - Maximum file size: 10MB
     * - Allowed image types: JPEG, PNG, GIF, WebP
     * - Allowed video types: MP4, WebM, MOV
     * - Maximum 10 media items per company
     * 
     * Request format: multipart/form-data
     * - file: The file to upload (required)
     * - mediaType: IMAGE or VIDEO (required)
     * - title: Optional title for the media
     * - description: Optional description
     * 
     * Example using curl:
     * curl -X POST http://localhost:8080/media/upload \
     *   -H "Authorization: Bearer {jwt-token}" \
     *   -F "file=@logo.png" \
     *   -F "mediaType=IMAGE" \
     *   -F "title=Company Logo"
     * 
     * Example using JavaScript fetch:
     * const formData = new FormData();
     * formData.append('file', fileInput.files[0]);
     * formData.append('mediaType', 'IMAGE');
     * formData.append('title', 'Company Logo');
     * 
     * fetch('/media/upload', {
     *   method: 'POST',
     *   headers: { 'Authorization': 'Bearer ' + token },
     *   body: formData
     * });
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param file The file to upload (multipart file)
     * @param mediaType The type of media (IMAGE or VIDEO)
     * @param title Optional title for the media
     * @param description Optional description
     * @return HTTP 201 Created with upload details including public URL
     */
    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponseDto> uploadMedia(
            @CurrentUser AuthenticatedUser user,
            @RequestParam("file") MultipartFile file,
            @RequestParam("mediaType") CompanyMedia.MediaType mediaType,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        
        try {
            // Upload file to Supabase Storage
            String publicUrl = supabaseStorageService.uploadFile(file, company.getCompanyId(), mediaType.name());
            
            // Create database record with the URL
            CompanyMedia media = mediaService.addMedia(
                    company.getCompanyId(),
                    publicUrl,
                    mediaType,
                    title,
                    description,
                    null  // orderIndex will be auto-assigned
            );
            
            // Build response with upload details
            ImageUploadResponseDto response = ImageUploadResponseDto.builder()
                    .publicUrl(publicUrl)
                    .fileName(extractFileName(publicUrl))
                    .mediaType(mediaType)
                    .fileSize(file.getSize())
                    .originalFileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .mediaId(media.getMediaId())
                    .message("File uploaded successfully")
                    .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Failed to upload media: {}", e.getMessage(), e);
            throw new BusinessException("Failed to upload media. Please ensure Supabase storage is configured properly: " + e.getMessage());
        }
    }

    /**
     * Helper method to extract filename from Supabase public URL.
     * 
     * @param publicUrl The full public URL
     * @return The filename portion
     */
    private String extractFileName(String publicUrl) {
        int lastSlash = publicUrl.lastIndexOf('/');
        return lastSlash >= 0 ? publicUrl.substring(lastSlash + 1) : publicUrl;
    }

    /**
     * Retrieves all media items for the authenticated company.
     * Returns both active and inactive media, ordered by display sequence.
     * 
     * This endpoint is intended for the company's admin dashboard where
     * they manage their entire media gallery, including unpublished items.
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @return HTTP 200 OK with list of all media items sorted by orderIndex
     */
    @GetMapping
    public ResponseEntity<List<CompanyMediaResponseDto>> getAllMedia(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getMediaByCompany(company.getCompanyId());
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves only active (published) media for the authenticated company.
     * 
     * This endpoint is used for public-facing pages where only approved
     * media should be displayed to job seekers viewing the company profile.
     * Companies can toggle media active/inactive to control what's publicly visible.
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @return HTTP 200 OK with list of published media items
     */
    @GetMapping("/active")
    public ResponseEntity<List<CompanyMediaResponseDto>> getActiveMedia(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getActiveMediaByCompany(company.getCompanyId());
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Filters media by type (IMAGE or VIDEO).
     * 
     * Useful for UI components that separate image galleries from video sections.
     * For example, a company profile might show images in a photo carousel
     * and videos in a separate video player section.
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param mediaType Either IMAGE or VIDEO (case-sensitive enum)
     * @return HTTP 200 OK with filtered list of media matching the type
     */
    @GetMapping("/type/{mediaType}")
    public ResponseEntity<List<CompanyMediaResponseDto>> getMediaByType(
            @CurrentUser AuthenticatedUser user,
            @PathVariable CompanyMedia.MediaType mediaType) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getMediaByType(company.getCompanyId(), mediaType);
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Updates metadata for an existing media item.
     * 
     * Note: This endpoint does NOT change the media URL itself.
     * To replace the actual file, delete the old media and create a new one.
     * 
     * All fields in the request are optional - only provided fields are updated:
     * - title: Display title for the media
     * - description: Additional context or caption
     * - orderIndex: Change display position (though /reorder is preferred for batch changes)
     * - isActive: Toggle visibility in public profile
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param mediaId The unique identifier of the media to update
     * @param requestDto Updated fields (all optional)
     * @return HTTP 200 OK with the updated media details
     */
    @PutMapping("/{mediaId}")
    public ResponseEntity<CompanyMediaResponseDto> updateMedia(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String mediaId,
            @Valid @RequestBody CompanyMediaUpdateDto requestDto) {
        
        CompanyMedia media = mediaService.updateMedia(
                mediaId,
                requestDto.getTitle(),
                requestDto.getDescription(),
                requestDto.getOrderIndex(),
                requestDto.getIsActive()
        );
        
        CompanyMediaResponseDto response = mapToMediaResponse(media);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a media item from the company's gallery.
     * 
     * Security: The service layer verifies ownership before deletion,
     * preventing companies from deleting other companies' media.
     * 
     * Note: This only removes the database record. The actual media file
     * in cloud storage should be deleted separately (typically via a scheduled
     * cleanup job to handle race conditions safely).
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param mediaId The unique identifier of the media to delete
     * @return HTTP 204 No Content on successful deletion
     */
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String mediaId) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        mediaService.deleteMedia(mediaId, company.getCompanyId());
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Reorders the entire media gallery in one operation.
     * 
     * The client sends an ordered list of media IDs representing the desired
     * display sequence. This is more efficient than updating orderIndex
     * individually, especially for drag-and-drop UI components.
     * 
     * Example request body:
     * ["mediaId3", "mediaId1", "mediaId2"]
     * 
     * This will display mediaId3 first, followed by mediaId1, then mediaId2.
     * 
     * The service layer assigns sequential orderIndex values (0, 1, 2...)
     * and verifies all media items belong to the authenticated company.
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @param mediaIds Ordered list of media IDs in desired display sequence
     * @return HTTP 200 OK on successful reordering
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderMedia(
            @CurrentUser AuthenticatedUser user,
            @RequestBody List<String> mediaIds) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        mediaService.reorderMedia(company.getCompanyId(), mediaIds);
        
        return ResponseEntity.ok().build();
    }

    /**
     * Returns the current number of media items for the company.
     * 
     * This is useful for:
     * - Displaying upload progress (e.g., "5 / 10 media uploaded")
     * - Client-side validation before attempting upload
     * - Showing remaining capacity in the UI
     * 
     * The count includes both active and inactive media since the limit
     * applies to total storage, not just published items.
     * 
     * @param user The authenticated company user (extracted from JWT)
     * @return HTTP 200 OK with the count as a long value
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getMediaCount(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        long count = mediaService.getMediaCount(company.getCompanyId());
        
        return ResponseEntity.ok(count);
    }

    /**
     * Helper method to convert CompanyMedia entity to DTO for API responses.
     * 
     * This separation ensures we never expose internal entity details
     * and can easily modify response structure without changing the database model.
     * 
     * @param media The CompanyMedia entity from database
     * @return CompanyMediaResponseDto for API response
     */
    private CompanyMediaResponseDto mapToMediaResponse(CompanyMedia media) {
        return CompanyMediaResponseDto.builder()
                .mediaId(media.getMediaId())
                .companyId(media.getCompanyId())
                .url(media.getUrl())
                .mediaType(media.getMediaType())
                .title(media.getTitle())
                .description(media.getDescription())
                .orderIndex(media.getOrderIndex())
                .isActive(media.getIsActive())
                .uploadedAt(media.getUploadedAt())
                .build();
    }
}
