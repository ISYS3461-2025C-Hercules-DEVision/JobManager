package com.job.manager.job.dto;

import com.job.manager.job.enums.SalaryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating a new job post
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateJobPostRequest {

    private String title;
    
    private String department;
    
    private String description;
    
    /**
     * List of employment types. Can include multiple (e.g., ["Internship", "Contract"]).
     * Cannot include both "Full-time" and "Part-time".
     * Valid values: "Full-time", "Part-time", "Internship", "Contract"
     */
    private List<String> employmentTypes;
    
    private LocalDate expiryDate;
    
    /**
     * Salary type: RANGE, ABOUT, UP_TO, FROM, or NEGOTIABLE
     */
    private SalaryType salaryType;
    
    /**
     * Minimum salary (required for RANGE and FROM types)
     */
    private BigDecimal salaryMin;
    
    /**
     * Maximum salary (required for RANGE and UP_TO types)
     */
    private BigDecimal salaryMax;
    
    /**
     * Currency code (e.g., "USD", "VND")
     */
    private String salaryCurrency;
    
    private String location;
    
    private boolean published;
    
    private List<String> skills;
    
    /**
     * Job requirements (e.g., education, certifications, years of experience)
     */
    private String requirements;
    
    /**
     * Key responsibilities and duties
     */
    private String responsibilities;
    
    /**
     * Benefits offered (e.g., health insurance, 401k, remote work)
     */
    private String benefits;
    
    /**
     * Experience level required: Entry-level, Mid-level, Senior, Lead, Executive
     */
    private String experienceLevel;
}
