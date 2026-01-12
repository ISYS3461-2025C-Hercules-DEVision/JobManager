package com.job.manager.company.controller;

import com.job.manager.company.annotation.CurrentUser;
import com.job.manager.company.dto.*;
import com.job.manager.company.entity.Company;
import com.job.manager.company.entity.PublicProfile;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.service.CompanyService;
import com.job.manager.company.service.SupabaseStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    /**
     * Get all companies - paginated
     * @param take page size
     * @param page page number (1-based)
     * Example: /companies?take=20&page=1
     */
    @GetMapping("/companies")
    public ResponseEntity<org.springframework.data.domain.Page<CompanyInternalDTO>> getAllCompanies(
            @RequestParam(defaultValue = "20") int take,
            @RequestParam(defaultValue = "1") int page) {
        org.springframework.data.domain.Page<Company> companies = companyService.getAllCompanies(take, page);
        org.springframework.data.domain.Page<CompanyInternalDTO> dtos = companies.map(company -> CompanyInternalDTO.builder()
            .companyId(company.getCompanyId())
            .companyName(company.getCompanyName())
            .email(company.getEmail())
            .isPremium(company.getIsPremium())
            .isActive(company.getIsActive())
            .isEmailVerified(company.getIsEmailVerified())
            .postedDate(company.getCreatedAt())
            .expiryDate(company.getUpdatedAt())
            .build());
        return ResponseEntity.ok(dtos);
    }

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
                    .postedDate(company.getCreatedAt())
                    .expiryDate(company.getUpdatedAt())
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

    /**
     * Create public profile with file uploads (combined endpoint).
     * <p>
     * This endpoint accepts both form data (text fields) AND file uploads
     * in a single multipart/form-data request.
     *
     * @param user               The authenticated company user
     * @param companyName        Company display name
     * @param aboutUs            About us description
     * @param whoWeAreLookingFor Who we are looking for description
     * @param websiteUrl         Company website URL
     * @param industryDomain     Industry/domain
     * @param country            Country
     * @param city               City
     * @param logoFile           Logo image file (optional)
     * @param bannerFile         Banner image file (optional)
     * @return Created public profile with uploaded image URLs
     */
    @PostMapping(value = "/public-profile/with-images", consumes = "multipart/form-data")
    public ResponseEntity<PublicProfileResponseDto> createPublicProfileWithImages(
            @CurrentUser AuthenticatedUser user,
            @RequestParam("companyName") String companyName,
            @RequestParam(value = "aboutUs", required = false) String aboutUs,
            @RequestParam(value = "whoWeAreLookingFor", required = false) String whoWeAreLookingFor,
            @RequestParam(value = "websiteUrl", required = false) String websiteUrl,
            @RequestParam(value = "industryDomain", required = false) String industryDomain,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "logo", required = false) MultipartFile logoFile,
            @RequestParam(value = "banner", required = false) MultipartFile bannerFile) {

        Company company = companyService.getCompanyByEmail(user.getEmail());

        // Upload logo if provided
        String logoUrl = null;
        if (logoFile != null && !logoFile.isEmpty()) {
            logoUrl = supabaseStorageService.uploadFile(logoFile, company.getCompanyId() + "/profile", "IMAGE");
        }

        // Upload banner if provided
        String bannerUrl = null;
        if (bannerFile != null && !bannerFile.isEmpty()) {
            bannerUrl = supabaseStorageService.uploadFile(bannerFile, company.getCompanyId() + "/profile", "IMAGE");
        }

        // Create profile with uploaded URLs
        PublicProfile profile = companyService.createPublicProfile(
                company.getCompanyId(),
                companyName,
                aboutUs,
                whoWeAreLookingFor,
                websiteUrl,
                industryDomain,
                country,
                city,
                logoUrl,
                bannerUrl
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

    @GetMapping("/public-profile/{companyId}")
    public ResponseEntity<PublicProfileResponseDto> getPublicProfile(@PathVariable String companyId) {
        Company company = companyService.getCompanyById(companyId);
        PublicProfile profile = companyService.getPublicProfile(companyId);

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

    /**
     * Upload company logo image directly to Supabase Storage.
     * <p>
     * This endpoint handles logo uploads and automatically updates the public profile.
     * The logo is used throughout the platform (company profile, job listings, etc.).
     * <p>
     * Recommended logo specifications:
     * - Square aspect ratio (1:1)
     * - Minimum size: 200x200 pixels
     * - Maximum size: 1000x1000 pixels
     * - Formats: PNG (preferred for transparency), JPEG, WebP
     * - File size limit: 2MB
     *
     * @param user The authenticated company user
     * @param file The logo image file
     * @return The public URL of the uploaded logo and updated profile
     */
    @PostMapping("/public-profile/logo")
    public ResponseEntity<ProfileImageUploadResponseDto> uploadLogo(
            @CurrentUser AuthenticatedUser user,
            @RequestParam("file") MultipartFile file) {

        Company company = companyService.getCompanyByEmail(user.getEmail());

        // Check if public profile exists first
        if (!companyService.hasPublicProfile(company.getCompanyId())) {
            throw new BusinessException("Please create a public profile before uploading logo");
        }

        // Upload logo to Supabase Storage
        String logoUrl = supabaseStorageService.uploadFile(file, company.getCompanyId() + "/profile", "IMAGE");

        // Update the public profile with the new logo URL
        PublicProfile profile = companyService.getPublicProfile(company.getCompanyId());
        profile.setLogoUrl(logoUrl);
        companyService.updatePublicProfile(
                company.getCompanyId(),
                profile.getDisplayName(),
                profile.getAboutUs(),
                profile.getWhoWeAreLookingFor(),
                profile.getWebsiteUrl(),
                profile.getIndustryDomain(),
                logoUrl,
                profile.getBannerUrl()
        );

        ProfileImageUploadResponseDto response = ProfileImageUploadResponseDto.builder()
                .imageUrl(logoUrl)
                .imageType("LOGO")
                .fileName(extractFileName(logoUrl))
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .message("Logo uploaded successfully")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Upload company banner image directly to Supabase Storage.
     * <p>
     * This endpoint handles banner uploads and automatically updates the public profile.
     * The banner is displayed prominently on the company profile page.
     * <p>
     * Recommended banner specifications:
     * - Wide aspect ratio (16:9 or 21:9)
     * - Minimum size: 1920x1080 pixels
     * - Maximum size: 3840x2160 pixels
     * - Formats: JPEG, PNG, WebP
     * - File size limit: 5MB
     *
     * @param user The authenticated company user
     * @param file The banner image file
     * @return The public URL of the uploaded banner and updated profile
     */
    @PostMapping("/public-profile/banner")
    public ResponseEntity<ProfileImageUploadResponseDto> uploadBanner(    
            @CurrentUser AuthenticatedUser user,
            @RequestParam("file") MultipartFile file) {

        Company company = companyService.getCompanyByEmail(user.getEmail());

        // Check if public profile exists first
        if (!companyService.hasPublicProfile(company.getCompanyId())) {
            throw new BusinessException("Please create a public profile before uploading banner");
        }

        // Upload banner to Supabase Storage
        String bannerUrl = supabaseStorageService.uploadFile(file, company.getCompanyId() + "/profile", "IMAGE");

        // Update the public profile with the new banner URL
        PublicProfile profile = companyService.getPublicProfile(company.getCompanyId());
        profile.setBannerUrl(bannerUrl);
        companyService.updatePublicProfile(
                company.getCompanyId(),
                profile.getDisplayName(),
                profile.getAboutUs(),
                profile.getWhoWeAreLookingFor(),
                profile.getWebsiteUrl(),
                profile.getIndustryDomain(),
                profile.getLogoUrl(),
                bannerUrl
        );

        ProfileImageUploadResponseDto response = ProfileImageUploadResponseDto.builder()
                .imageUrl(bannerUrl)
                .imageType("BANNER")
                .fileName(extractFileName(bannerUrl))
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .message("Banner uploaded successfully")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Helper method to extract filename from Supabase public URL.
     */
    private String extractFileName(String publicUrl) {
        int lastSlash = publicUrl.lastIndexOf('/');
        return lastSlash >= 0 ? publicUrl.substring(lastSlash + 1) : publicUrl;
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