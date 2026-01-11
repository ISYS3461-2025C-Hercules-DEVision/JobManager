package com.job.manager.applicant.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ApplicantCreatedEvent {

    private String applicantId;
    
    // Full name for matching and notifications
    private String firstName;
    private String lastName;
    private String email;
    
    // Location for matching
    private String city;
    private String country;
    
    // Skills for matching
    private List<String> technicalTags;
    
    // Employment preferences for matching
    private Set<String> employmentTypes;
    
    // Salary expectations for matching
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;
    
    // Education for matching
    private String highestEducationDegree;
}