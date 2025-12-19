package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for updating existing media items.
 * 
 * All fields are optional - only the provided fields will be updated.
 * This allows partial updates without requiring the client to send
 * all fields every time.
 * 
 * Note: The media URL itself cannot be changed through this DTO.
 * To replace the actual file, delete the old media and create a new one.
 * 
 * Common use cases:
 * - Update title/description to add context
 * - Toggle isActive to publish/unpublish from public profile
 * - Change orderIndex to reposition in gallery (though /reorder endpoint is preferred)
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMediaUpdateDto {

    /**
     * New display title for the media.
     * If null, the existing title remains unchanged.
     */
    private String title;

    /**
     * New description or caption.
     * If null, the existing description remains unchanged.
     */
    private String description;

    /**
     * New display position in the gallery.
     * If null, the current position remains unchanged.
     * 
     * For reordering multiple items, use the /reorder endpoint instead
     * which handles the operation more efficiently and atomically.
     */
    private Integer orderIndex;

    /**
     * Visibility toggle for the media.
     * - true: Media is published and visible in public profile
     * - false: Media is hidden from public view but not deleted
     * - null: Current visibility status remains unchanged
     * 
     * This allows companies to temporarily hide media without losing it,
     * useful for seasonal content or work-in-progress items.
     */
    private Boolean isActive;
}
