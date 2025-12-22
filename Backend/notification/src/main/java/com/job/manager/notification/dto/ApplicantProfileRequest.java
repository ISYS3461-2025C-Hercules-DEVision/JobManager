package com.job.manager.notification.dto;

import com.job.manager.notification.model.EmploymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ApplicantProfileRequest {

    private String applicantId;
    private String name;

    private List<String> technicalTags;
    private Set<EmploymentStatus> employmentStatus;
    private String country;

    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    private String highestEducationDegree;
}