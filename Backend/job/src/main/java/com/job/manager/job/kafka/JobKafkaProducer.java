package com.job.manager.job.kafka;

import com.job.manager.job.entity.JobPost;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class JobKafkaProducer {

    private final KafkaTemplate<String, JobPost> kafkaTemplate;

    @Value("${kafka.topic.job-updates}")
    private String jobPostUpdatesTopic;

    public JobKafkaProducer(KafkaTemplate<String, JobPost> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendJobUpdate(JobPost jobPost) {
        kafkaTemplate.send(jobPostUpdatesTopic, jobPost);
    }
}