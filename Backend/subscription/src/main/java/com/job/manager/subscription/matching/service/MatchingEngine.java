package com.job.manager.matching.service;

import com.job.manager.matching.dto.ApplicantCreatedEvent;
import com.job.manager.matching.dto.CompanySearchProfileDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class MatchingEngine {

    public boolean matches(ApplicantCreatedEvent applicant, CompanySearchProfileDto profile) {
        // 1. Country must match
        if (applicant.getCountry() == null || profile.getCountry() == null) {
            return false;
        }
        if (!applicant.getCountry().equalsIgnoreCase(profile.getCountry())) {
            return false;
        }

        // 2. At least one technical tag overlaps
        if (applicant.getTechnicalTags() == null || profile.getTechnicalTags() == null) {
            return false;
        }
        boolean hasTagOverlap = applicant.getTechnicalTags().stream()
                .anyMatch(tag -> profile.getTechnicalTags().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(tag)));
        if (!hasTagOverlap) {
            return false;
        }

        // 3. Employment status overlap (if company specified any)
        if (profile.getEmploymentStatus() != null && !profile.getEmploymentStatus().isEmpty()) {
            Set<String> applicantStatuses =
                    applicant.getEmploymentStatus() != null ? applicant.getEmploymentStatus() : Set.of();
            Set<String> profileStatuses = new HashSet<>(profile.getEmploymentStatus());
            boolean statusOverlap = applicantStatuses.stream().anyMatch(profileStatuses::contains);
            if (!statusOverlap) {
                return false;
            }
        }

        // 4. Salary overlap
        BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
        BigDecimal profileMax = profile.getSalaryMax(); // null = no upper bound

        if (applicant.getExpectedSalaryMin() == null && applicant.getExpectedSalaryMax() == null) {
            // no preference, accept
            return true;
        }

        BigDecimal applicantMin = applicant.getExpectedSalaryMin();
        BigDecimal applicantMax = applicant.getExpectedSalaryMax();

        if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) {
            return false;
        }
        if (profileMax != null && applicantMin != null && applicantMin.compareTo(profileMax) > 0) {
            return false;
        }

        // 5. Education (if company specified a minimum level; here we just do exact match)
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