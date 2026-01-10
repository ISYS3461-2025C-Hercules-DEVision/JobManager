package com.job.manager.job.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.job.manager.job.enums.SalaryType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Document(collection = "job-posts")
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPost {

    @Id
    private UUID id;

    private String companyId; 

    private String title;

    private String department;

    private String description;

    /**
     * Employment types for this job post.
     * Can include multiple types (e.g., Internship + Contract).
     * Cannot include both Full-time AND Part-time simultaneously.
     * Valid values: "Full-time", "Part-time", "Internship", "Contract"
     */
    private List<String> employmentTypes;

    private LocalDate postedDate;

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

    private List<String> skills; // Technical Skills tags

    /**
     * Experience level required (e.g., Entry-level, Mid-level, Senior)
     */
    private String experienceLevel;

    /**
     * Job responsibilities - detailed list of what the role entails
     */
    private String responsibilities;

    /**
     * Job requirements - qualifications and requirements needed
     */
    private String requirements;

    /**
     * Benefits offered - perks and benefits for the position
     */
    private String benefits;
}