package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperience {
    
    private String jobTitle;         // e.g., "Java Developer"
    private String company;          // e.g., "Tech Vietnam"
    private String description;      // e.g., "Developed Spring Boot microservices"
    private Integer yearsOfExperience; // e.g., 3
    private String startDate;        // e.g., "2020-01"
    private String endDate;          // e.g., "2023-12" or null for current position
}
