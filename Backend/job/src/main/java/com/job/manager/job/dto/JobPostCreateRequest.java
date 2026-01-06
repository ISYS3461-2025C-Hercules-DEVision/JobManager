package com.job.manager.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class JobPostCreateRequest {
    
    private String title;
    
    private String description;
    
    private Set<String> employmentTypes; // Full-time, Part-time, Internship, Contract
    
    private LocalDate expiryDate; // Optional
    
    private SalaryDTO salary;
    
    private String location;
    
    private boolean published; // Default false for draft
    
    private List<String> skills; // Technical Skills tags
}
