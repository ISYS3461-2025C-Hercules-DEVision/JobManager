package com.job.manager.notification.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applicants")
public class ApplicantProfile {

    @Id
    private String applicantId;

    private String name;

    private List<String> technicalTags;
    private Set<EmploymentStatus> employmentStatus;
    private String country;

    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    private String highestEducationDegree;
}