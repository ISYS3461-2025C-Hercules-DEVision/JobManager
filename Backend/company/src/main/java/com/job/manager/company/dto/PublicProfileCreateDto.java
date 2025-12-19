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
    
    @Pattern(regexp = "^https?://.*", message = "Logo URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String logoUrl;  // Optional - can be uploaded later
    
    @Pattern(regexp = "^https?://.*", message = "Banner URL must be a valid HTTP/HTTPS URL", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String bannerUrl;  // Optional - can be uploaded later
}
