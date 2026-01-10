package com.job.manager.subscription.model;

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

    // This matches the "id" claim from JWT (userId = companyId in your system)
    private String companyId;

    private List<String> technicalTags;                 // desired technical tags
    private Set<EmploymentStatus> employmentStatus;     // desired employment statuses
    private String country;                             // desired country, e.g. "VN"

    private BigDecimal salaryMin;                       // desired min salary (nullable => 0)
    private BigDecimal salaryMax;                       // desired max salary (nullable => no upper bound)

    private String highestEducationDegree;              // e.g. "BACHELOR", "MASTER"
}