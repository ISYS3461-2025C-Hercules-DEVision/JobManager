package com.job.manager.job.dto;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.entity.Salary;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class JobPostResponse {
    
    private UUID id;
    
    private String companyId;
    
    private String title;
    
    private String description;
    
    private Set<String> employmentTypes;
    
    private LocalDate postedDate;
    
    private LocalDate expiryDate;
    
    private SalaryDTO salary;
    
    private String location;
    
    private boolean published;
    
    private List<String> skills;
    
    public static JobPostResponse fromEntity(JobPost jobPost) {
        JobPostResponse response = new JobPostResponse();
        response.setId(jobPost.getId());
        response.setCompanyId(jobPost.getCompanyId());
        response.setTitle(jobPost.getTitle());
        response.setDescription(jobPost.getDescription());
        response.setEmploymentTypes(jobPost.getEmploymentTypes());
        response.setPostedDate(jobPost.getPostedDate());
        response.setExpiryDate(jobPost.getExpiryDate());
        response.setSalary(SalaryDTO.fromEntity(jobPost.getSalary()));
        response.setLocation(jobPost.getLocation());
        response.setPublished(jobPost.isPublished());
        response.setSkills(jobPost.getSkills());
        
        return response;
    }
}
