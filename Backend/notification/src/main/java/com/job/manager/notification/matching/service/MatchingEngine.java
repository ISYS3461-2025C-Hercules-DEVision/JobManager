package com.job.manager.notification.matching.service;

import com.job.manager.notification.matching.dto.ApplicantCreatedEvent;
import com.job.manager.notification.matching.dto.CompanySearchProfileDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MatchingEngine {

    public boolean matches(ApplicantCreatedEvent applicant, CompanySearchProfileDto profile) {
        // Country matching (required)
        if (applicant.getCountry() == null || profile.getCountry() == null) {
            return false;
        }
        if (!applicant.getCountry().equalsIgnoreCase(profile.getCountry())) {
            return false;
        }

        // Technical tags matching (at least one overlap required)
        if (applicant.getSkills() == null || profile.getTechnicalTags() == null) {
            return false;
        }
        boolean hasTagOverlap = applicant.getSkills().stream()
                .anyMatch(tag -> profile.getTechnicalTags().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(tag)));
        if (!hasTagOverlap) {
            return false;
        }

        // Salary range matching
        BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
        BigDecimal profileMax = profile.getSalaryMax();

        if (applicant.getMinSalary() == null && applicant.getMaxSalary() == null) {
            return true;
        }

        BigDecimal applicantMin = applicant.getMinSalary();
        BigDecimal applicantMax = applicant.getMaxSalary();

        // Check if salary ranges overlap
        if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) {
            return false;
        }
        return profileMax == null || applicantMin == null || applicantMin.compareTo(profileMax) <= 0;
    }

    public List<String> findMatchingCompanyIds(
            ApplicantCreatedEvent applicant,
            List<CompanySearchProfileDto> profiles
    ) {
        return profiles.stream()
                .filter(p -> matches(applicant, p))
                .map(CompanySearchProfileDto::getCompanyId)
                .toList();
    }
}

