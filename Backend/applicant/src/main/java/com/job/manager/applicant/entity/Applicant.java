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
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    
    // Location
    private String city;
    private String country;
    
    // Professional Information
    private String objectiveSummary;
    private List<Education> education;
    private List<WorkExperience> workExperience;
    private String highestEducationDegree;  // Bachelor, Master, Doctorate
    
    // Job Preferences
    private List<String> technicalTags;
    private Set<String> employmentTypes;  // Renamed from employmentStatus for clarity
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
