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
@Document(collection = "company_search_profiles")
public class CompanySearchProfile {

    @Id
    private String id;

    // This should match the "id" claim from JWT (userId / companyId)
    private String companyId;

    private List<String> technicalTags;          // ["Kafka", "Spring Boot"]
    private Set<EmploymentStatus> employmentStatus;
    private String country;                      // "VN", "US", etc.

    private BigDecimal salaryMin;                // nullable
    private BigDecimal salaryMax;                // nullable

    private String highestEducationDegree;       // e.g. "BACHELOR", "MASTER"
}