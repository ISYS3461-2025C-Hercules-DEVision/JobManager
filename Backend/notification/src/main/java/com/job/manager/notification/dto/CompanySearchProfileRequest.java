package com.job.manager.notification.dto;

import com.job.manager.notification.model.EmploymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class CompanySearchProfileRequest {

    private List<String> technicalTags;
    private Set<EmploymentStatus> employmentStatus;
    private String country;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String highestEducationDegree;
}