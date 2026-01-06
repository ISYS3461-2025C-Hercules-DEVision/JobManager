package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {

    private String applicantId;
    private String name;

    private List<String> technicalTags;
    private Set<String> employmentStatus;
    private String country;

    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    private String highestEducationDegree;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
