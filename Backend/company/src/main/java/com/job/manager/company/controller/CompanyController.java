package com.job.manager.company.controller;

import com.job.manager.company.annotation.CurrentUser;
import com.job.manager.company.dto.*;
import com.job.manager.company.entity.Company;
import com.job.manager.company.entity.PublicProfile;
import com.job.manager.company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    // Check if user has completed public profile setup
    @GetMapping("/profile/status")
    public ResponseEntity<ProfileStatusDto> checkProfileStatus(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        boolean hasProfile = companyService.hasPublicProfile(company.getCompanyId());
        
        return ResponseEntity.ok(ProfileStatusDto.builder()
                .companyId(company.getCompanyId())
                .hasPublicProfile(hasProfile)
                .build());
    }

    // Get company details
    @GetMapping("/profile")
    public ResponseEntity<CompanyResponseDto> getProfile(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        boolean hasProfile = companyService.hasPublicProfile(company.getCompanyId());
        
        CompanyResponseDto response = CompanyResponseDto.builder()
                .companyId(company.getCompanyId())
                .companyName(company.getCompanyName())
                .email(company.getEmail())
                .phoneNumber(company.getPhoneNumber())
                .streetAddress(company.getStreetAddress())
                .city(company.getCity())
                .country(company.getCountry())
                .isEmailVerified(company.getIsEmailVerified())
                .isActive(company.getIsActive())
                .isPremium(company.getIsPremium())
                .ssoProvider(company.getSsoProvider())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .hasPublicProfile(hasProfile)
                .build();
        
        return ResponseEntity.ok(response);
    }

    // Update company basic information
    @PutMapping("/profile")
    public ResponseEntity<CompanyProfileUpdateDto> updateProfile(
            @CurrentUser AuthenticatedUser user, 
            @Valid @RequestBody CompanyProfileUpdateDto requestDto) {
        CompanyProfileUpdateDto response = companyService.updateProfile(user.getEmail(), requestDto);
        return ResponseEntity.ok(response);
    }

    // Create public profile (first-time onboarding)
    @PostMapping("/public-profile")
    public ResponseEntity<PublicProfileResponseDto> createPublicProfile(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody PublicProfileCreateDto requestDto) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        
        PublicProfile profile = companyService.createPublicProfile(
                company.getCompanyId(),
                requestDto.getCompanyName(),
                requestDto.getLogoUrl(),
                requestDto.getBannerUrl()
        );
        
        PublicProfileResponseDto response = mapToPublicProfileResponse(profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get public profile
    @GetMapping("/public-profile")
    public ResponseEntity<PublicProfileResponseDto> getPublicProfile(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        PublicProfile profile = companyService.getPublicProfile(company.getCompanyId());
        
        PublicProfileResponseDto response = mapToPublicProfileResponse(profile);
        return ResponseEntity.ok(response);
    }

    // Update public profile (from settings page)
    @PutMapping("/public-profile")
    public ResponseEntity<PublicProfileResponseDto> updatePublicProfile(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody PublicProfileUpdateDto requestDto) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        
        PublicProfile profile = companyService.updatePublicProfile(
                company.getCompanyId(),
                requestDto.getDisplayName(),
                requestDto.getAboutUs(),
                requestDto.getWhoWeAreLookingFor(),
                requestDto.getWebsiteUrl(),
                requestDto.getIndustryDomain(),
                requestDto.getLogoUrl(),
                requestDto.getBannerUrl()
        );
        
        PublicProfileResponseDto response = mapToPublicProfileResponse(profile);
        return ResponseEntity.ok(response);
    }

    private PublicProfileResponseDto mapToPublicProfileResponse(PublicProfile profile) {
        return PublicProfileResponseDto.builder()
                .companyId(profile.getCompanyId())
                .displayName(profile.getDisplayName())
                .aboutUs(profile.getAboutUs())
                .whoWeAreLookingFor(profile.getWhoWeAreLookingFor())
                .websiteUrl(profile.getWebsiteUrl())
                .industryDomain(profile.getIndustryDomain())
                .logoUrl(profile.getLogoUrl())
                .bannerUrl(profile.getBannerUrl())
                .country(profile.getCountry())
                .city(profile.getCity())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class ProfileStatusDto {
    private String companyId;
    private Boolean hasPublicProfile;
}