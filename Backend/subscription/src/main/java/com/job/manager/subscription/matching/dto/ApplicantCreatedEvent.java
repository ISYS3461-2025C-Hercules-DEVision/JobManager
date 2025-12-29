package com.job.manager.matching.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ApplicantCreatedEvent {

    private String applicantId;
    private String name;

    private List<String> technicalTags;
    private Set<String> employmentStatus;
    private String country;

    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    private String highestEducationDegree;
}