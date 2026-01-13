package com.job.manager.applicant.dto;

import com.job.manager.applicant.entity.Education;
import com.job.manager.applicant.entity.WorkExperience;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ApplicantCreateRequest {

    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String city;
    private String country;
    
    // Profile Summary
    private String objectiveSummary;
    
    // Education
    private List<Education> education;
    private String highestEducationDegree;  // e.g., "BACHELOR", "MASTER", "DOCTORATE"
    
    // Work Experience
    private List<WorkExperience> workExperience;
    
    // Skills & Tags
    private List<String> technicalTags;
    
    // Employment Preferences
    private Set<String> employmentTypes;    // e.g., ["FULL_TIME", "CONTRACT"]
    
    // Salary Expectations
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;
}