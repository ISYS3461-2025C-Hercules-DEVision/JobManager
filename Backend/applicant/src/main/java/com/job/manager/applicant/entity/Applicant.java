package com.job.manager.applicant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applicants")
public class Applicant {
    
    @Id
    private String applicantId;
    
    // Personal Information
    private String firstName;
    private String lastName;
    
    @Indexed(unique = true)
    private String email;
    
    private String city;
    private String country;
    
    // Profile Summary
    private String objectiveSummary;
    
    // Education
    private List<Education> education;
    private String highestEducationDegree;  // e.g., "BACHELOR", "MASTER", "DOCTORATE"
    
    // Work Experience
    private List<WorkExperience> workExperience;
    
    // Skills & Tags
    private List<String> technicalTags;
    
    // Employment Preferences
    private Set<String> employmentTypes;    // e.g., ["FULL_TIME", "CONTRACT"]
    
    // Salary Expectations
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}
