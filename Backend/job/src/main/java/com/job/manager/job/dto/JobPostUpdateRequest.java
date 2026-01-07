package com.job.manager.job.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class JobPostUpdateRequest {
    
    private String title;
    
    private String description;
    
    private Set<String> employmentTypes;
    
    private LocalDate expiryDate;
    
    private SalaryDTO salary;
    
    private String location;
    
    private List<String> skills;
}
