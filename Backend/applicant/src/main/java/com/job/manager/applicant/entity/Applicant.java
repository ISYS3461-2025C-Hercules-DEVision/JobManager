package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Document(collection = "applicants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Applicant {

    @Id
    private String id;
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
