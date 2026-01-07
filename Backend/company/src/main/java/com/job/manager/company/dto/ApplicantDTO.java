package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Detailed applicant information (for clicking on applicant)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {

    private String applicantId;
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    
    // Location
    private String city;
    private String country;
    
    // Professional Information
    private String objectiveSummary;
    private List<EducationDTO> education;
    private List<WorkExperienceDTO> workExperience;
    private String highestEducationDegree;
    
    // Job Preferences
    private List<String> technicalTags;
    private Set<String> employmentTypes;
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
