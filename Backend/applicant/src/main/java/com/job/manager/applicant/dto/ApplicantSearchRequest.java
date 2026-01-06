package com.job.manager.applicant.dto;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ApplicantSearchRequest {
    
    // Location - only one value (city OR country)
    private String city;
    private String country;
    
    // Education filter
    private String education;  // Bachelor, Master, Doctorate
    
    // Work Experience filter
    private String workExperienceKeyword;  // Case-insensitive search
    private String hasWorkExperience;  // "None", "Any", or null for any
    
    // Employment Types - can select multiple
    private Set<String> employmentTypes;  // FULL_TIME, PART_TIME, CONTRACT, etc.
}
