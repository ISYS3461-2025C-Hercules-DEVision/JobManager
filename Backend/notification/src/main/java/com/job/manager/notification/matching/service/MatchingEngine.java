package com.job.manager.notification.matching.service;

import com.job.manager.notification.matching.dto.ApplicantCreatedEvent;
import com.job.manager.notification.matching.dto.CompanySearchProfileDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
public class MatchingEngine {

    public boolean matches(ApplicantCreatedEvent applicant, CompanySearchProfileDto profile) {
        String applicantId = applicant.getApplicantId();
        String companyId = profile.getCompanyId();

        log.debug("Evaluating match: applicant {} vs company profile {}", applicantId, companyId);

        // Country matching (required)
        if (applicant.getCountry() == null || profile.getCountry() == null) {
            log.debug("Match failed (null country): applicant {} (country: {}) vs company {} (country: {})",
                    applicantId, applicant.getCountry(), companyId, profile.getCountry());
            return false;
        }
        if (!applicant.getCountry().equalsIgnoreCase(profile.getCountry())) {
            log.debug("Match failed (country mismatch): applicant {} ({}) vs company {} ({})",
                    applicantId, applicant.getCountry(), companyId, profile.getCountry());
            return false;
        }

        // Technical tags matching (at least one overlap required)
        if (applicant.getSkills() == null || profile.getTechnicalTags() == null) {
            log.debug("Match failed (null skills/tags): applicant {} (skills: {}) vs company {} (tags: {})",
                    applicantId, applicant.getSkills(), companyId, profile.getTechnicalTags());
            return false;
        }

        List<String> matchingSkills = applicant.getSkills().stream()
                .filter(skill -> profile.getTechnicalTags().stream()
                        .anyMatch(tag -> tag.equalsIgnoreCase(skill)))
                .toList();

        boolean hasTagOverlap = !matchingSkills.isEmpty();
        if (!hasTagOverlap) {
            log.debug("Match failed (no skill overlap): applicant {} (skills: {}) vs company {} (tags: {})",
                    applicantId, applicant.getSkills(), companyId, profile.getTechnicalTags());
            return false;
        }

        log.debug("Skills matched: {} - applicant {} with company {}",
                matchingSkills, applicantId, companyId);

        // Salary range matching
        BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
        BigDecimal profileMax = profile.getSalaryMax();
        BigDecimal applicantMin = applicant.getMinSalary();
        BigDecimal applicantMax = applicant.getMaxSalary();

        if (applicantMin == null && applicantMax == null) {
            log.debug("Match successful (no salary constraints): applicant {} with company {}",
                    applicantId, companyId);
            return true;
        }

        // Check if salary ranges overlap
        if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) {
            log.debug("Match failed (salary too low): applicant {} (max: {}) vs company {} (min: {})",
                    applicantId, applicantMax, companyId, profileMin);
            return false;
        }

        if (profileMax != null && applicantMin != null && applicantMin.compareTo(profileMax) > 0) {
            log.debug("Match failed (salary too high): applicant {} (min: {}) vs company {} (max: {})",
                    applicantId, applicantMin, companyId, profileMax);
            return false;
        }

        log.info("✓ Match successful: applicant {} matched with company {} (country: {}, skills: {}, salary overlap: {}-{} vs {}-{})",
                applicantId, companyId, applicant.getCountry(), matchingSkills,
                applicantMin, applicantMax, profileMin, profileMax);

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

