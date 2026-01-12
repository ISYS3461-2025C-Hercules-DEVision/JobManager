package com.job.manager.job.service;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.kafka.JobKafkaProducer;
import com.job.manager.job.repository.JobRepository;
import com.job.manager.job.validator.JobPostValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobKafkaProducer kafkaProducer;
    private final MongoTemplate mongoTemplate;
    private final JobPostValidator validator;

    public JobService(JobRepository jobRepository,
                      JobKafkaProducer kafkaProducer, 
                      MongoTemplate mongoTemplate,
                      JobPostValidator validator) {
        this.jobRepository = jobRepository;
        this.kafkaProducer = kafkaProducer;
        this.mongoTemplate = mongoTemplate;
        this.validator = validator;
    }

    public JobPost createJobPost(JobPost jobPost) {
        // Validate employment types and salary before saving
        validator.validate(jobPost);
        
        jobPost.setId(UUID.randomUUID());
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

    public List<JobPost> getJobsForCompany(String companyId) {
        return jobRepository.findByCompanyIdOrderByPostedDateDesc(companyId);
    }

    public JobPost getJobById(String jobId) {
        JobPost job = jobRepository.findById(UUID.fromString(jobId))
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return job;
    }

    public JobPost updateJobPost(String jobId, String companyId, JobPost updatedJob) {
        JobPost existingJob = getJobById(jobId);

        if (!existingJob.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to job post");
        }

        // Validate employment types and salary before updating
        validator.validate(updatedJob);

        // Update fields
        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDepartment(updatedJob.getDepartment());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setEmploymentTypes(updatedJob.getEmploymentTypes());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setSalaryType(updatedJob.getSalaryType());
        existingJob.setSalaryMin(updatedJob.getSalaryMin());
        existingJob.setSalaryMax(updatedJob.getSalaryMax());
        existingJob.setSalaryCurrency(updatedJob.getSalaryCurrency());
        existingJob.setSkills(updatedJob.getSkills());
        existingJob.setPublished(updatedJob.isPublished());
        existingJob.setExpiryDate(updatedJob.getExpiryDate());
        existingJob.setRequirements(updatedJob.getRequirements());
        existingJob.setResponsibilities(updatedJob.getResponsibilities());
        existingJob.setBenefits(updatedJob.getBenefits());
        existingJob.setExperienceLevel(updatedJob.getExperienceLevel());

        JobPost saved = jobRepository.save(existingJob);

        try {
            kafkaProducer.sendJobUpdate(saved);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }

        return saved;
    }

    public void deleteJobPost(String jobId, String companyId) {
        JobPost job = getJobById(jobId);

        if (!job.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to job post");
        }

        jobRepository.delete(job);

        try {
            kafkaProducer.sendJobUpdate(job);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
    }

    public void bulkActivate(List<String> jobIds, String companyId) {
        for (String jobId : jobIds) {
            try {
                JobPost job = getJobById(jobId);
                if (!job.getCompanyId().equals(companyId)) {
                    throw new RuntimeException("Unauthorized access to job post");
                }
                job.setPublished(true);
                job.setExpiryDate(null); // Clear expiry when activating
                jobRepository.save(job);

                try {
                    kafkaProducer.sendJobUpdate(job);
                } catch (Exception e) {
                    System.err.println("Kafka publish failed: " + e.getMessage());
                }
            } catch (Exception e) {
                System.err.println("Failed to activate job " + jobId + ": " + e.getMessage());
            }
        }
    }

    public void bulkClose(List<String> jobIds, String companyId) {
        for (String jobId : jobIds) {
            try {
                JobPost job = getJobById(jobId);
                if (!job.getCompanyId().equals(companyId)) {
                    throw new RuntimeException("Unauthorized access to job post");
                }
                job.setPublished(false);
                job.setExpiryDate(LocalDate.now()); // Set expiry to today
                jobRepository.save(job);

                try {
                    kafkaProducer.sendJobUpdate(job);
                } catch (Exception e) {
                    System.err.println("Kafka publish failed: " + e.getMessage());
                }
            } catch (Exception e) {
                System.err.println("Failed to close job " + jobId + ": " + e.getMessage());
            }
        }
    }

    public void bulkDelete(List<String> jobIds, String companyId) {
        for (String jobId : jobIds) {
            try {
                deleteJobPost(jobId, companyId);
            } catch (Exception e) {
                System.err.println("Failed to delete job " + jobId + ": " + e.getMessage());
            }
        }
    }

    public Page<JobPost> getJobs(
            String title,
            String location,
            String employmentType,
            String keyword,
            int page,
            int size
    ) {

        Query query = new Query();

        if (title != null && !title.isBlank()) {
            query.addCriteria(
                    Criteria.where("title")
                            .regex(title, "i")
            );
        }

        if (location != null && !location.isBlank()) {
            query.addCriteria(
                    Criteria.where("location").is(location)
            );
        }

        if (employmentType != null && !employmentType.isBlank()) {
            query.addCriteria(
                    Criteria.where("employmentTypes").in(employmentType)
            );
        }

        if (keyword != null && !keyword.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("title").regex(keyword, "i"),
                    Criteria.where("description").regex(keyword, "i")
            ));
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        query.with(pageable);

        List<JobPost> jobs =
                mongoTemplate.find(query, JobPost.class);

        long total =
                mongoTemplate.count(
                        Query.of(query).limit(-1).skip(-1),
                        JobPost.class
                );

        return new PageImpl<>(jobs, pageable, total);
    }


}
