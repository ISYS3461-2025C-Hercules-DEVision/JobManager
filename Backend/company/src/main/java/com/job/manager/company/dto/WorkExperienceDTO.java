package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Work experience information for applicant detail
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperienceDTO {
    private String jobTitle;
    private String company;
    private String description;
    private Integer yearsOfExperience;
    private String startDate;
    private String endDate;
}
