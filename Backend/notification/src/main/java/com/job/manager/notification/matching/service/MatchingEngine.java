package com.job.manager.notification.matching.service;

import com.job.manager.notification.matching.dto.ApplicantCreatedEvent;
import com.job.manager.notification.matching.dto.CompanySearchProfileDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        if (applicant.getTechnicalTags() == null || profile.getTechnicalTags() == null) {
            return false;
        }
        boolean hasTagOverlap = applicant.getTechnicalTags().stream()
                .anyMatch(tag -> profile.getTechnicalTags().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(tag)));
        if (!hasTagOverlap) {
            return false;
        }

        // Employment status matching (if profile specifies preferences)
        if (profile.getEmploymentStatus() != null && !profile.getEmploymentStatus().isEmpty()) {
            Set<String> applicantTypes =
                    applicant.getEmploymentTypes() != null ? applicant.getEmploymentTypes() : Set.of();
            Set<String> profileStatuses = new HashSet<>(profile.getEmploymentStatus());
            boolean statusOverlap = applicantTypes.stream().anyMatch(profileStatuses::contains);
            if (!statusOverlap) {
                return false;
            }
        }

        // Salary range matching
        BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
        BigDecimal profileMax = profile.getSalaryMax();

        if (applicant.getExpectedSalaryMin() == null && applicant.getExpectedSalaryMax() == null) {
            return true;
        }

        BigDecimal applicantMin = applicant.getExpectedSalaryMin();
        BigDecimal applicantMax = applicant.getExpectedSalaryMax();

        // Check if salary ranges overlap
        if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) {
            return false;
        }
        if (profileMax != null && applicantMin != null && applicantMin.compareTo(profileMax) > 0) {
            return false;
        }

        // Education level matching
        if (profile.getHighestEducationDegree() != null) {
            if (applicant.getHighestEducationDegree() == null) {
                return false;
            }
            if (!applicant.getHighestEducationDegree()
                    .equalsIgnoreCase(profile.getHighestEducationDegree())) {
                return false;
            }
        }

        return true;
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

