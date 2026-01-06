package com.job.manager.company.dto;

import lombok.Data;

import java.util.Set;

/**
 * Search request DTO for company to search applicants
 */
@Data
public class ApplicantSearchRequestDTO {
    
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
