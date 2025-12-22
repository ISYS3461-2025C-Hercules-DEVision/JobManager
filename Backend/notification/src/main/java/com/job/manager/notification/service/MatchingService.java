package com.job.manager.notification.service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import com.job.manager.notification.model.ApplicantProfile;
import com.job.manager.notification.model.CompanySearchProfile;
import com.job.manager.notification.model.EmploymentStatus;

public class MatchingService {
    public boolean matches(ApplicantProfile applicant, CompanySearchProfile profile) {
        // 1. Country must match
        if (applicant.getCountry() == null || profile.getCountry() == null) {
            return false;
        }
        if (!applicant.getCountry().equalsIgnoreCase(profile.getCountry())) {
            return false;
        }

        // 2. Tags: require at least one overlap
        if (applicant.getTechnicalTags() == null || profile.getTechnicalTags() == null) {
            return false;
        }
        boolean hasTagOverlap = applicant.getTechnicalTags().stream()
                .anyMatch(tag -> profile.getTechnicalTags().stream()
                        .anyMatch(t -> t.equalsIgnoreCase(tag)));
        if (!hasTagOverlap) {
            return false;
        }

        // 3. Employment status
        if (profile.getEmploymentStatus() != null && !profile.getEmploymentStatus().isEmpty()) {
            Set<EmploymentStatus> applicantStatuses =
                    applicant.getEmploymentStatus() != null ? applicant.getEmploymentStatus() : Set.of();

            Set<EmploymentStatus> profileStatuses = new HashSet<>(profile.getEmploymentStatus());

            // (We can later add the special FULL_TIME/PART_TIME rule here)
            boolean statusOverlap = applicantStatuses.stream().anyMatch(profileStatuses::contains);
            if (!statusOverlap) {
                return false;
            }
        }
        // else: if profile doesn't specify statuses, accept all

        // 4. Salary range
        BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
        BigDecimal profileMax = profile.getSalaryMax(); // null = no upper limit

        if (applicant.getExpectedSalaryMin() == null && applicant.getExpectedSalaryMax() == null) {
            // applicants with no salary preference always match if other criteria match
            return true;
        }

        // Overlap check
        BigDecimal applicantMin = applicant.getExpectedSalaryMin();
        BigDecimal applicantMax = applicant.getExpectedSalaryMax();

        // applicantMax >= profileMin
        if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) {
            return false;
        }

        // applicantMin <= profileMax (if profileMax is set)
        if (profileMax != null && applicantMin != null && applicantMin.compareTo(profileMax) > 0) {
            return false;
        }

        // 5. Education (simple exact match for now)
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
}
