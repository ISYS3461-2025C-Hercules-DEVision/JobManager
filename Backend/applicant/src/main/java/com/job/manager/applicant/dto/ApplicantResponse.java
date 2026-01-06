package com.job.manager.applicant.dto;

import com.job.manager.applicant.entity.Education;
import com.job.manager.applicant.entity.WorkExperience;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Detailed response for clicking on applicant (Requirement 5.1.4)
 * Shows all information including Education, Work Experience, and Objective Summary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantResponse {

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
    private List<Education> education;
    private List<WorkExperience> workExperience;
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
