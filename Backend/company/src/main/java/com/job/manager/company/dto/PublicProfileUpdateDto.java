package com.job.manager.company.dto;

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
    
    private String websiteUrl;
    
    private String industryDomain;
    
    private String logoUrl;
    
    private String bannerUrl;
}
