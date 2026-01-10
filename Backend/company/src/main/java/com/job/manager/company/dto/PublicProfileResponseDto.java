package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PublicProfileResponseDto {
    
    private String companyId;
    private String displayName;
    private String aboutUs;
    private String whoWeAreLookingFor;
    private String websiteUrl;
    private String industryDomain;
    private String logoUrl;
    private String bannerUrl;
    private String country;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
