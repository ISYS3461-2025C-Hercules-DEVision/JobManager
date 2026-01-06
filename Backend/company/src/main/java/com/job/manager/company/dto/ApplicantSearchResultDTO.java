package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Summary response for search results
 * Displays: First Name, Last Name, Email, City, Country, Highest Education Degree
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
}
