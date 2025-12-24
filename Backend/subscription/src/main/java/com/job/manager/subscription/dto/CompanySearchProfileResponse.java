package com.job.manager.subscription.dto;

import com.job.manager.subscription.model.EmploymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class CompanySearchProfileResponse {

    private List<String> technicalTags;
    private Set<EmploymentStatus> employmentStatus;
    private String country;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String highestEducationDegree;
}