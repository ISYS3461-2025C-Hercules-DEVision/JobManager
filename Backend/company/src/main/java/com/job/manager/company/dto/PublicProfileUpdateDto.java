package com.job.manager.company.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PublicProfileUpdateDto {
    
    @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters")
    private String displayName;
    
    @Size(max = 2000, message = "About us cannot exceed 2000 characters")
    private String aboutUs;
    
    @Size(max = 1000, message = "Who we are looking for cannot exceed 1000 characters")
    private String whoWeAreLookingFor;
    
    @Pattern(regexp = "^https?://.*", message = "Website URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String websiteUrl;
    
    @Size(max = 100, message = "Industry domain cannot exceed 100 characters")
    private String industryDomain;
    
    @Pattern(regexp = "^https?://.*", message = "Logo URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String logoUrl;
    
    @Pattern(regexp = "^https?://.*", message = "Banner URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String bannerUrl;
}
