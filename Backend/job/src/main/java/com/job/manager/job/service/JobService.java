package com.job.manager.job.service;

import com.job.manager.job.dto.JobPostCreateRequest;
import com.job.manager.job.dto.JobPostUpdateRequest;
import com.job.manager.job.dto.SalaryDTO;
import com.job.manager.job.entity.JobPost;
import com.job.manager.job.entity.Salary;
import com.job.manager.job.entity.Salary.SalaryType;
import com.job.manager.job.kafka.JobKafkaProducer;
import com.job.manager.job.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobKafkaProducer kafkaProducer;

    public JobService(JobRepository jobRepository,
                      JobKafkaProducer kafkaProducer) {
        this.jobRepository = jobRepository;
        this.kafkaProducer = kafkaProducer;
    }

    public JobPost createJobPost(JobPostCreateRequest request, String companyId) {
        // Validate employment types
        validateEmploymentTypes(request.getEmploymentTypes());
        
        // Convert DTO to entity and validate salary if present
        Salary salary = SalaryDTO.toEntity(request.getSalary());
        if (salary != null) {
            validateSalary(salary);
        }
        
        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Job title is required");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Job description is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Job location is required");
        }
        if (request.getEmploymentTypes() == null || request.getEmploymentTypes().isEmpty()) {
            throw new IllegalArgumentException("At least one employment type is required");
        }

        // Create job post entity
        JobPost jobPost = new JobPost();
        jobPost.setId(UUID.randomUUID());
        jobPost.setCompanyId(companyId);
        jobPost.setTitle(request.getTitle());
        jobPost.setDescription(request.getDescription());
        jobPost.setLocation(request.getLocation());
        jobPost.setEmploymentTypes(request.getEmploymentTypes());
        jobPost.setSalary(salary);
        jobPost.setSkills(request.getSkills());
        jobPost.setExpiryDate(request.getExpiryDate());
        jobPost.setPublished(false); // New jobs are private by default
        jobPost.setPostedDate(LocalDate.now());

        JobPost saved = jobRepository.save(jobPost);
        
        try {
            kafkaProducer.sendJobUpdate(saved);
        } catch (Exception e) {
            // log only — do NOT fail API
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
        
        return saved;
    }

    public JobPost updateJobPost(UUID jobId, JobPostUpdateRequest request, String companyId) {
        // Find job and verify ownership
        JobPost jobPost = jobRepository.findByIdAndCompanyId(jobId, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Job post not found or access denied"));

        // Validate employment types if provided
        if (request.getEmploymentTypes() != null) {
            validateEmploymentTypes(request.getEmploymentTypes());
            jobPost.setEmploymentTypes(request.getEmploymentTypes());
        }
        
        // Convert DTO to entity and validate salary if provided
        if (request.getSalary() != null) {
            Salary salary = SalaryDTO.toEntity(request.getSalary());
            validateSalary(salary);
            jobPost.setSalary(salary);
        }
        
        // Update fields
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            jobPost.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            jobPost.setDescription(request.getDescription());
        }
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            jobPost.setLocation(request.getLocation());
        }
        if (request.getSkills() != null) {
            jobPost.setSkills(request.getSkills());
        }
        if (request.getExpiryDate() != null) {
            jobPost.setExpiryDate(request.getExpiryDate());
        }

        JobPost updated = jobRepository.save(jobPost);
        
        try {
            kafkaProducer.sendJobUpdate(updated);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
        
        return updated;
    }

    public void deleteJobPost(UUID jobId, String companyId) {
        // Find job and verify ownership
        JobPost jobPost = jobRepository.findByIdAndCompanyId(jobId, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Job post not found or access denied"));
        
        jobRepository.delete(jobPost);
        
        try {
            kafkaProducer.sendJobUpdate(jobPost);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
    }

    public JobPost publishJobPost(UUID jobId, String companyId) {
        // Find job and verify ownership
        JobPost jobPost = jobRepository.findByIdAndCompanyId(jobId, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Job post not found or access denied"));
        
        jobPost.setPublished(true);
        JobPost published = jobRepository.save(jobPost);
        
        try {
            kafkaProducer.sendJobUpdate(published);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
        
        return published;
    }

    public JobPost getJobPost(UUID jobId, String companyId) {
        return jobRepository.findByIdAndCompanyId(jobId, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Job post not found or access denied"));
    }

    public List<JobPost> getJobsForCompany(String companyId) {
        return jobRepository.findByCompanyIdOrderByPostedDateDesc(companyId);
    }

    public List<JobPost> getPublicJobs() {
        return jobRepository.findAllByPublishedTrue();
    }

    /**
     * Validates employment types according to business rules:
     * - Full-time and Part-time are mutually exclusive
     * - Internship and Contract can coexist with other types
     */
    private void validateEmploymentTypes(Set<String> employmentTypes) {
        if (employmentTypes == null || employmentTypes.isEmpty()) {
            throw new IllegalArgumentException("At least one employment type is required");
        }
        
        boolean hasFullTime = employmentTypes.stream()
            .anyMatch(type -> type.equalsIgnoreCase("Full-time"));
        boolean hasPartTime = employmentTypes.stream()
            .anyMatch(type -> type.equalsIgnoreCase("Part-time"));
        
        if (hasFullTime && hasPartTime) {
            throw new IllegalArgumentException("Full-time and Part-time are mutually exclusive");
        }
        
        // Validate that all employment types are recognized
        for (String type : employmentTypes) {
            if (!isValidEmploymentType(type)) {
                throw new IllegalArgumentException("Invalid employment type: " + type);
            }
        }
    }

    private boolean isValidEmploymentType(String type) {
        String normalized = type.toLowerCase().trim();
        return normalized.equals("full-time") || 
               normalized.equals("part-time") || 
               normalized.equals("contract") || 
               normalized.equals("internship");
    }

    /**
     * Validates salary structure according to salary type:
     * - RANGE: must have min and max
     * - ESTIMATION: must have value
     * - NEGOTIABLE: should not have min, max, or value
     */
    private void validateSalary(Salary salary) {
        if (salary == null) {
            return; // Salary is optional
        }
        
        SalaryType type = salary.getType();
        if (type == null) {
            throw new IllegalArgumentException("Salary type is required");
        }
        
        switch (type) {
            case RANGE:
                if (salary.getMin() == null || salary.getMax() == null) {
                    throw new IllegalArgumentException("RANGE salary must have min and max values");
                }
                if (salary.getMin() > salary.getMax()) {
                    throw new IllegalArgumentException("Salary min cannot be greater than max");
                }
                if (salary.getValue() != null) {
                    throw new IllegalArgumentException("RANGE salary should not have a value field");
                }
                break;
                
            case ESTIMATION:
                if (salary.getValue() == null) {
                    throw new IllegalArgumentException("ESTIMATION salary must have a value");
                }
                if (salary.getMin() != null || salary.getMax() != null) {
                    throw new IllegalArgumentException("ESTIMATION salary should not have min/max fields");
                }
                break;
                
            case NEGOTIABLE:
                if (salary.getMin() != null || salary.getMax() != null || salary.getValue() != null) {
                    throw new IllegalArgumentException("NEGOTIABLE salary should not have min, max, or value fields");
                }
                break;
        }
    }

}
