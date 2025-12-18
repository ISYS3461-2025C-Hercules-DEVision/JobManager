package com.job.manager.company.dto;

import com.job.manager.company.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CompanyResponseDto {
    
    private String companyId;
    private String companyName;
    private String email;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String country;
    private Boolean isEmailVerified;
    private Boolean isActive;
    private Boolean isPremium;
    private Company.SsoProvider ssoProvider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean hasPublicProfile;  // Indicates if public profile is created
}
