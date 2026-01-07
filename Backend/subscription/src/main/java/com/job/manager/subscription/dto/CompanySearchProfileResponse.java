package com.job.manager.subscription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.job.manager.subscription.model.EmploymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanySearchProfileResponse {
    private String companyId;
    private List<String> technicalTags;
    
    // For internal company API (returns enum values)
    private Set<EmploymentStatus> employmentStatus;
    
    // For cross-service communication (returns string values)
    private Set<String> employmentStatusStrings;
    
    private String country;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String highestEducationDegree;
}