package com.job.manager.job.service;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.kafka.JobKafkaProducer;
import com.job.manager.job.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
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

    public JobPost createJobPost(JobPost jobPost) {
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

    public JobPost getJobById(String jobId, String companyId) {
        JobPost job = jobRepository.findById(UUID.fromString(jobId))
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to job post");
        }
        
        return job;
    }

    public JobPost updateJobPost(String jobId, String companyId, JobPost updatedJob) {
        JobPost existingJob = getJobById(jobId, companyId);
        
        // Update fields
        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setEmploymentType(updatedJob.getEmploymentType());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setSalary(updatedJob.getSalary());
        existingJob.setSkills(updatedJob.getSkills());
        existingJob.setPublished(updatedJob.isPublished());
        existingJob.setExpiryDate(updatedJob.getExpiryDate());
        
        JobPost saved = jobRepository.save(existingJob);
        
        try {
            kafkaProducer.sendJobUpdate(saved);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
        
        return saved;
    }

    public void deleteJobPost(String jobId, String companyId) {
        JobPost job = getJobById(jobId, companyId);
        jobRepository.delete(job);
        
        try {
            kafkaProducer.sendJobUpdate(job);
        } catch (Exception e) {
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
    }

}
