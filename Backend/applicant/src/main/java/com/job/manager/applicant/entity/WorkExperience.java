package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperience {
    private String jobTitle;
    private String company;
    private String description;
    private Integer yearsOfExperience;
    private String startDate;
    private String endDate;
}
