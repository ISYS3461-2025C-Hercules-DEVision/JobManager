package com.job.manager.company.controller;

import com.job.manager.company.annotation.CurrentUser;
import com.job.manager.company.client.ApplicantClient;
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

import java.util.List;

@RestController
@RequestMapping("/")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private ApplicantClient applicantClient;

    // Internal endpoint for service-to-service calls (e.g., subscription service
    // validation)
    @GetMapping("/companies/{companyId}")
    public ResponseEntity<CompanyInternalDTO> getCompanyById(@PathVariable String companyId) {
        try {
            Company company = companyService.getCompanyById(companyId);

            CompanyInternalDTO dto = CompanyInternalDTO.builder()
                    .companyId(company.getCompanyId())
                    .companyName(company.getCompanyName())
                    .email(company.getEmail())
                    .isPremium(company.getIsPremium())
                    .isActive(company.getIsActive())
                    .isEmailVerified(company.getIsEmailVerified())
                    .build();

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            // Return 404 if company not found (for proper error handling in other services)
            return ResponseEntity.notFound().build();
        }
    }

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
                requestDto.getAboutUs(),
                requestDto.getWhoWeAreLookingFor(),
                requestDto.getWebsiteURL(),
                requestDto.getIndustryDomain(),
                requestDto.getCountry(),
                requestDto.getCity(),
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
                requestDto.getBannerUrl());

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

    // Get list of all applicants
    @GetMapping("/applicants")
    public ResponseEntity<List<ApplicantDTO>> getApplicants(@CurrentUser AuthenticatedUser user) {
        try {
            // Verify company exists and is authenticated
            Company company = companyService.getCompanyByEmail(user.getEmail());
            
            // Fetch applicants from applicant service
            List<ApplicantDTO> applicants = applicantClient.getAllApplicants();
            
            return ResponseEntity.ok(applicants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search applicants with filters (Requirements 5.1.1, 5.1.2, 5.1.3)
     * Allows companies to search for job applicants using multiple criteria
     */
    @PostMapping("/applicants/search")
    public ResponseEntity<List<ApplicantSearchResultDTO>> searchApplicants(
            @CurrentUser AuthenticatedUser user,
            @RequestBody ApplicantSearchRequestDTO searchRequest) {
        try {
            // Verify company exists and is authenticated
            Company company = companyService.getCompanyByEmail(user.getEmail());
            
            // Search applicants from applicant service
            List<ApplicantSearchResultDTO> results = applicantClient.searchApplicants(searchRequest);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get applicant detail by ID (Requirement 5.1.4)
     * Shows full information including Education, Work Experience, and Objective Summary
     */
    @GetMapping("/applicants/{applicantId}")
    public ResponseEntity<ApplicantDTO> getApplicantDetail(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String applicantId) {
        try {
            // Verify company exists and is authenticated
            Company company = companyService.getCompanyByEmail(user.getEmail());
            
            // Fetch applicant detail from applicant service
            ApplicantDTO applicant = applicantClient.getApplicantById(applicantId);
            
            if (applicant == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(applicant);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class ProfileStatusDto {
    private String companyId;
    private boolean hasPublicProfile;  // Changed from Boolean to boolean primitive
}