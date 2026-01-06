package com.job.manager.company.dto;

import lombok.Data;

import java.util.List;
import java.util.Set;

/**
 * Search request DTO for company to search applicants
 */
@Data
public class ApplicantSearchRequestDTO {
    
    // Full-Text Search (Requirement 5.2.1)
    // Searches across Work Experience, Objective Summary, and Technical Skills
    private String fullTextSearch;
    
    // Technical Skills Tag Filter (Requirement 5.2.2)
    // OR logic: applicant with ANY of these tags will be included
    private List<String> technicalTags;
    
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
