package com.job.manager.job.service;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.kafka.JobKafkaProducer;
import com.job.manager.job.repository.JobRepository;
import org.springframework.stereotype.Service;

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
        JobPost saved = jobRepository.save(jobPost);
        kafkaProducer.sendJobUpdate(saved); // Notify applicants
        return saved;
    }

}
