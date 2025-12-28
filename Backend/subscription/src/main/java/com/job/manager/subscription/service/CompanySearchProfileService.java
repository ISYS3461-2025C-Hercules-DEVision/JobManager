package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.CompanySearchProfileRequest;
import com.job.manager.subscription.dto.CompanySearchProfileResponse;
import com.job.manager.subscription.model.CompanySearchProfile;
import com.job.manager.subscription.repository.CompanySearchProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanySearchProfileService {

    private final CompanySearchProfileRepository profileRepository;
    private final SubscriptionService subscriptionService; // assume you have this

    public void upsertProfile(String companyId, CompanySearchProfileRequest request) {
        // 1. Ensure company is premium
        if (!subscriptionService.isPremiumActive(companyId)) {
            throw new IllegalStateException("Company is not premium, cannot create search profile");
        }

        // 2. Upsert profile
        CompanySearchProfile profile = profileRepository.findByCompanyId(companyId)
                .orElseGet(CompanySearchProfile::new);

        profile.setCompanyId(companyId);
        profile.setTechnicalTags(request.getTechnicalTags());
        profile.setEmploymentStatus(request.getEmploymentStatus());
        profile.setCountry(request.getCountry());
        profile.setSalaryMin(request.getSalaryMin());
        profile.setSalaryMax(request.getSalaryMax());
        profile.setHighestEducationDegree(request.getHighestEducationDegree());

        profileRepository.save(profile);
    }

    // For a single company (used by GET /search-profile)
    public CompanySearchProfileResponse getProfile(String companyId) {
        CompanySearchProfile profile = profileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalStateException("Search profile not found for company " + companyId));

        return CompanySearchProfileResponse.builder()
                .companyId(profile.getCompanyId())
                .technicalTags(profile.getTechnicalTags())
                .employmentStatus(profile.getEmploymentStatus())
                .country(profile.getCountry())
                .salaryMin(profile.getSalaryMin())
                .salaryMax(profile.getSalaryMax())
                .highestEducationDegree(profile.getHighestEducationDegree())
                .build();
    }

    // For matching service: return ALL company profiles
    public List<CompanySearchProfileResponse> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(p -> CompanySearchProfileResponse.builder()
                        .companyId(p.getCompanyId())   // assumes field exists in entity
                        .technicalTags(p.getTechnicalTags())
                        .employmentStatus(p.getEmploymentStatus())
                        .country(p.getCountry())
                        .salaryMin(p.getSalaryMin())
                        .salaryMax(p.getSalaryMax())
                        .highestEducationDegree(p.getHighestEducationDegree())
                        .build()
                )
                .toList();
    }
}