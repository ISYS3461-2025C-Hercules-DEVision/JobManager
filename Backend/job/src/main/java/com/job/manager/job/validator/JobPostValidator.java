package com.job.manager.job.validator;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.enums.SalaryType;
import com.job.manager.job.exception.InvalidEmploymentTypeException;
import com.job.manager.job.exception.InvalidSalaryException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Validator for JobPost entity
 * Handles all business rule validations for job posts
 */
@Component
public class JobPostValidator {

    /**
     * Validates all job post fields before saving
     */
    public void validate(JobPost jobPost) {
        validateEmploymentTypes(jobPost.getEmploymentTypes());
        validateSalary(jobPost);
    }

    /**
     * Validates employment types to ensure business rules are met:
     * - Can have multiple types (e.g., Internship + Contract)
     * - Cannot have both Full-time AND Part-time
     */
    public void validateEmploymentTypes(List<String> employmentTypes) {
        if (employmentTypes == null || employmentTypes.isEmpty()) {
            throw new InvalidEmploymentTypeException("At least one employment type is required");
        }

        boolean hasFullTime = employmentTypes.stream()
                .anyMatch(type -> type.equalsIgnoreCase("Full-time") || type.equalsIgnoreCase("FULL_TIME"));
        boolean hasPartTime = employmentTypes.stream()
                .anyMatch(type -> type.equalsIgnoreCase("Part-time") || type.equalsIgnoreCase("PART_TIME"));

        if (hasFullTime && hasPartTime) {
            throw new InvalidEmploymentTypeException(
                    "Job post cannot be both Full-time and Part-time simultaneously");
        }

        // Validate that all employment types are valid
        List<String> validTypes = List.of("Full-time", "Part-time", "Internship", "Contract",
                "FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT");
        for (String type : employmentTypes) {
            if (!validTypes.contains(type)) {
                throw new InvalidEmploymentTypeException(
                        "Invalid employment type: " + type + ". Valid types are: Full-time, Part-time, Internship, Contract");
            }
        }
    }

    /**
     * Validates salary fields based on salary type
     */
    public void validateSalary(JobPost jobPost) {
        SalaryType salaryType = jobPost.getSalaryType();
        BigDecimal salaryMin = jobPost.getSalaryMin();
        BigDecimal salaryMax = jobPost.getSalaryMax();
        String salaryCurrency = jobPost.getSalaryCurrency();

        if (salaryType == null) {
            throw new InvalidSalaryException("Salary type is required");
        }

        if (salaryCurrency == null || salaryCurrency.isBlank()) {
            throw new InvalidSalaryException("Salary currency is required");
        }

        switch (salaryType) {
            case RANGE:
                if (salaryMin == null || salaryMax == null) {
                    throw new InvalidSalaryException("RANGE salary type requires both minimum and maximum values");
                }
                if (salaryMin.compareTo(salaryMax) > 0) {
                    throw new InvalidSalaryException("Minimum salary cannot be greater than maximum salary");
                }
                if (salaryMin.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new InvalidSalaryException("Salary values must be positive");
                }
                break;

            case FROM:
                if (salaryMin == null) {
                    throw new InvalidSalaryException("FROM salary type requires minimum value");
                }
                if (salaryMin.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new InvalidSalaryException("Salary value must be positive");
                }
                break;

            case UP_TO:
                if (salaryMax == null) {
                    throw new InvalidSalaryException("UP_TO salary type requires maximum value");
                }
                if (salaryMax.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new InvalidSalaryException("Salary value must be positive");
                }
                break;

            case ABOUT:
                if (salaryMin == null) {
                    throw new InvalidSalaryException("ABOUT salary type requires a value (use salaryMin field)");
                }
                if (salaryMin.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new InvalidSalaryException("Salary value must be positive");
                }
                break;

            case NEGOTIABLE:
                // No specific fields required for negotiable
                break;

            default:
                throw new InvalidSalaryException("Invalid salary type: " + salaryType);
        }
    }
}
