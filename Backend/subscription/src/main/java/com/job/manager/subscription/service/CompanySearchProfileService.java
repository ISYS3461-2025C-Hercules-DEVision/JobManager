package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.CompanySearchProfileRequest;
import com.job.manager.subscription.dto.CompanySearchProfileResponse;
import com.job.manager.subscription.model.CompanySearchProfile;
import com.job.manager.subscription.repository.CompanySearchProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public CompanySearchProfileResponse getProfile(String companyId) {
        CompanySearchProfile profile = profileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalStateException("Search profile not found for company"));

        return CompanySearchProfileResponse.builder()
                .technicalTags(profile.getTechnicalTags())
                .employmentStatus(profile.getEmploymentStatus())
                .country(profile.getCountry())
                .salaryMin(profile.getSalaryMin())
                .salaryMax(profile.getSalaryMax())
                .highestEducationDegree(profile.getHighestEducationDegree())
                .build();
    }
}