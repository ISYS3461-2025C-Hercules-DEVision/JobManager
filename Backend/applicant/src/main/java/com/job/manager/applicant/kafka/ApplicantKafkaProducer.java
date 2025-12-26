package com.job.manager.applicant.kafka;

import com.job.manager.applicant.dto.ApplicantCreatedEvent;  // <-- updated
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicantKafkaProducer {

    private final KafkaTemplate<String, ApplicantCreatedEvent> kafkaTemplate;

    @Value("${kafka.topic.applicant-profile:applicant.profile}")
    private String applicantProfileTopic;

    public void publish(ApplicantCreatedEvent event) {
        kafkaTemplate.send(applicantProfileTopic, event);
    }
}