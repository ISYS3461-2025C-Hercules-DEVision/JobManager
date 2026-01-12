package com.job.manager.notification.matching.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ApplicantCreatedEvent {

    private String applicantId;
    private String fullName;
    private String country;
    private List<String> skills;
    private Boolean employmentStatus;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
}
