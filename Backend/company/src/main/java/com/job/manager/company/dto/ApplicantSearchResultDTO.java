package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Summary response for search results
 * Displays: First Name, Last Name, Email, City, Country, Highest Education Degree, Skill Tags
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantSearchResultDTO {
    
    private String applicantId;
    private String firstName;
    private String lastName;
    private String email;
    private String city;
    private String country;
    private String highestEducationDegree;
    private List<String> technicalTags;  // Requirement 5.2.5 - Display Skill Tags
}
