package com.job.manager.company.dto;

import jakarta.validation.constraints.NotBlank;
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
public class PublicProfileCreateDto {
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String companyName;
    
    @Size(max = 2000, message = "About us must not exceed 2000 characters")
    private String aboutUs;
    
    @Size(max = 1000, message = "Who we are looking for must not exceed 1000 characters")
    private String whoWeAreLookingFor;
    
    @Pattern(regexp = "^https?://.*", message = "Website URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String websiteURL;
    
    @Size(max = 100, message = "Industry domain must not exceed 100 characters")
    private String industryDomain;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Pattern(regexp = "^https?://.*", message = "Logo URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String logoUrl;  // Optional - can be uploaded later
    
    @Pattern(regexp = "^https?://.*", message = "Banner URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String bannerUrl;  // Optional - can be uploaded later
}
