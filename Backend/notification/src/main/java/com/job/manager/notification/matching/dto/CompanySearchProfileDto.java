package com.job.manager.notification.matching.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class CompanySearchProfileDto {

    private String companyId;
    private List<String> technicalTags;
    private Set<String> employmentStatus;
    private String country;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String highestEducationDegree;
}
