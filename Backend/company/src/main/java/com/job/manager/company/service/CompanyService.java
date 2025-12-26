package com.job.manager.company.service;

import com.job.manager.company.dto.CompanyProfileUpdateDto;
import com.job.manager.company.entity.Company;
import com.job.manager.company.entity.PublicProfile;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.repository.CompanyRepository;
import com.job.manager.company.repository.PublicProfileRepository;
import com.job.manager.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PublicProfileRepository publicProfileRepository;

    public CompanyProfileUpdateDto updateProfile(String email, CompanyProfileUpdateDto updatedRequest) {
        Company company = companyRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Company not found with email: " + email));

        // Update Company fields
        if (updatedRequest.getName() != null) {
            company.setCompanyName(updatedRequest.getName());
        }
        if (updatedRequest.getAddress() != null) {
            company.setStreetAddress(updatedRequest.getAddress());
        }
        if (updatedRequest.getCity() != null) {
            company.setCity(updatedRequest.getCity());
        }
        if (updatedRequest.getCountry() != null) {
            company.setCountry(updatedRequest.getCountry());
            company.setShardKey(updatedRequest.getCountry()); // Shard key = country
        }
        if (updatedRequest.getPhoneNumber() != null) {
            company.setPhoneNumber(updatedRequest.getPhoneNumber());
        }

        company.setUpdatedAt(LocalDateTime.now());

        // Save updated company to the database
        company = companyRepository.save(company);

        // Map back to DTO
        return CompanyProfileUpdateDto.builder()
                .name(company.getCompanyName())
                .email(company.getEmail())
                .phoneNumber(company.getPhoneNumber())
                .address(company.getStreetAddress())
                .city(company.getCity())
                .country(company.getCountry())
                .companyId(company.getCompanyId())
                .build();
    }

    @Transactional
    public void registerProfile(RegisterRequest registerRequest) {
        // Check if company already exists
        if (companyRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BusinessException("Company with this email already exists");
        }

        // Create Company entity only
        // PublicProfile will be created later when user completes onboarding
        Company newCompany = Company.builder()
                .companyId(registerRequest.getCompanyId())
                .companyName(registerRequest.getCompanyName())
                .email(registerRequest.getEmail())
                .phoneNumber(registerRequest.getPhoneNumber())
                .streetAddress(registerRequest.getAddress())
                .city(registerRequest.getCity())
                .country(registerRequest.getCountry())
                .shardKey(registerRequest.getCountry()) // Shard key = country
                .isEmailVerified(false) // Will be verified via email
                .isActive(true)
                .ssoProvider(Company.SsoProvider.LOCAL)
                .isPremium(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        companyRepository.save(newCompany);
    }

    public boolean hasPublicProfile(String companyId) {
        return publicProfileRepository.existsByCompanyId(companyId);
    }

    @Transactional
    public PublicProfile createPublicProfile(String companyId, String displayName, String aboutUs, 
                                            String whoWeAreLookingFor, String websiteUrl, 
                                            String industryDomain, String country, String city,
                                            String logoUrl, String bannerUrl) {
        // Check if company exists
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BusinessException("Company not found"));

        // Check if public profile already exists
        if (publicProfileRepository.existsByCompanyId(companyId)) {
            throw new BusinessException("Public profile already exists for this company");
        }

        // Create PublicProfile and save to MongoDB
        PublicProfile publicProfile = PublicProfile.builder()
                .companyId(companyId)
                .displayName(displayName)
                .aboutUs(aboutUs != null ? aboutUs : "")
                .whoWeAreLookingFor(whoWeAreLookingFor != null ? whoWeAreLookingFor : "")
                .websiteUrl(websiteUrl)
                .industryDomain(industryDomain)
                .country(country != null ? country : company.getCountry())
                .city(city != null ? city : company.getCity())
                .logoUrl(logoUrl)
                .bannerUrl(bannerUrl)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Save to MongoDB and return
        return publicProfileRepository.save(publicProfile);
    }

    @Transactional
    public PublicProfile updatePublicProfile(String companyId, String displayName, String aboutUs, 
                                            String whoWeAreLookingFor, String websiteUrl, 
                                            String industryDomain, String logoUrl, String bannerUrl) {
        PublicProfile profile = publicProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BusinessException("Public profile not found"));

        // Update fields if provided
        if (displayName != null) profile.setDisplayName(displayName);
        if (aboutUs != null) profile.setAboutUs(aboutUs);
        if (whoWeAreLookingFor != null) profile.setWhoWeAreLookingFor(whoWeAreLookingFor);
        if (websiteUrl != null) profile.setWebsiteUrl(websiteUrl);
        if (industryDomain != null) profile.setIndustryDomain(industryDomain);
        if (logoUrl != null) profile.setLogoUrl(logoUrl);
        if (bannerUrl != null) profile.setBannerUrl(bannerUrl);

        profile.setUpdatedAt(LocalDateTime.now());

        return publicProfileRepository.save(profile);
    }

    public Company getCompanyById(String companyId) {
        return companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BusinessException("Company not found"));
    }

    public Company getCompanyByEmail(String email) {
        return companyRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Company not found"));
    }

    public PublicProfile getPublicProfile(String companyId) {
        return publicProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BusinessException("Public profile not found"));
    }

    @Transactional
    public void updatePremiumStatus(String companyId, boolean isPremium) {
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BusinessException("Company not found: " + companyId));
        
        company.setIsPremium(isPremium);
        company.setUpdatedAt(LocalDateTime.now());
        
        companyRepository.save(company);
    }
}