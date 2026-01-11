package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    
    private String degree;           // e.g., "Bachelor", "Master", "Doctorate"
    private String fieldOfStudy;     // e.g., "Computer Science"
    private String institution;      // e.g., "HCMC University of Technology"
    private Integer graduationYear;  // e.g., 2020
}
