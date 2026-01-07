package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.CompanySearchProfileRequest;
import com.job.manager.subscription.dto.CompanySearchProfileResponse;
import com.job.manager.subscription.model.CompanySearchProfile;
import com.job.manager.subscription.repository.CompanySearchProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CompanySearchProfileService {

    private final CompanySearchProfileRepository profileRepository;
    private final SubscriptionService subscriptionService; // assume you have this

    public void upsertProfile(String companyId, CompanySearchProfileRequest request) {
        // 1. Ensure company is premium
        System.out.println(">>> [DEBUG] Checking premium status for companyId: " + companyId);
        boolean isPremium = subscriptionService.isPremiumActive(companyId);
        System.out.println(">>> [DEBUG] isPremiumActive returned: " + isPremium);
        if (!isPremium) {
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
                .employmentStatus(profile.getEmploymentStatus())  // Return enum for company API
                .country(profile.getCountry())
                .salaryMin(profile.getSalaryMin())
                .salaryMax(profile.getSalaryMax())
                .highestEducationDegree(profile.getHighestEducationDegree())
                .build();
    }

    // For matching service: return ALL company profiles
    public List<CompanySearchProfileResponse> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(p -> {
                    // Convert EmploymentStatus enum to Set<String> for cross-service compatibility
                    Set<String> employmentStatusStrings = null;
                    if (p.getEmploymentStatus() != null) {
                        employmentStatusStrings = p.getEmploymentStatus().stream()
                                .map(Enum::name)
                                .collect(java.util.stream.Collectors.toSet());
                    }
                    
                    return CompanySearchProfileResponse.builder()
                            .companyId(p.getCompanyId())
                            .technicalTags(p.getTechnicalTags())
                            .employmentStatus(p.getEmploymentStatus())  // Return enum set for internal use
                            .country(p.getCountry())
                            .salaryMin(p.getSalaryMin())
                            .salaryMax(p.getSalaryMax())
                            .highestEducationDegree(p.getHighestEducationDegree())
                            .build();
                })
                .toList();
    }
}