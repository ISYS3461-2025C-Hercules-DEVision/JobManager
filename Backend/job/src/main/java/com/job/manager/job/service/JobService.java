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

}
