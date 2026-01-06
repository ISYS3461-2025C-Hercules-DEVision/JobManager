package com.job.manager.company.controller;

import com.job.manager.company.dto.CompanyMediaResponseDto;
import com.job.manager.company.dto.PublicProfileResponseDto;
import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.entity.PublicProfile;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.service.CompanyMediaService;
import com.job.manager.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Public (unauthenticated) endpoints for job-seeker/applicant-facing pages.
 *
 * These APIs intentionally do NOT require JWT because they are meant to be consumed
 * by the Job Applicant subsystem to display company public profile and gallery.
 *
 * Base path: /public (will be /company/public through Kong with strip_path)
 */
@RestController
@RequestMapping("/public")
public class PublicCompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CompanyMediaService mediaService;

    /**
     * Publicly fetch a company's public profile by companyId.
     */
    @GetMapping("/companies/{companyId}/public-profile")
    public ResponseEntity<PublicProfileResponseDto> getCompanyPublicProfile(@PathVariable String companyId) {
        try {
            PublicProfile profile = companyService.getPublicProfile(companyId);
            return ResponseEntity.ok(mapToPublicProfileResponse(profile));
        } catch (BusinessException ex) {
            // For public GET, use 404 for missing resources (more client-friendly than 400).
            String msg = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
            if (msg.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw ex;
        }
    }

    /**
     * Publicly list only ACTIVE (published) media for a company by companyId.
     *
     * Note: This returns an empty list if the company has no media.
     */
    @GetMapping("/companies/{companyId}/media/active")
    public ResponseEntity<List<CompanyMediaResponseDto>> getCompanyActiveMedia(@PathVariable String companyId) {
        List<CompanyMedia> mediaList = mediaService.getActiveMediaByCompany(companyId);

        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());

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
