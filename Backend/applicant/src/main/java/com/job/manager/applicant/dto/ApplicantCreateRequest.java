package com.job.manager.applicant.dto;

import com.job.manager.applicant.entity.Education;
import com.job.manager.applicant.entity.WorkExperience;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ApplicantCreateRequest {

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
}