package com.job.manager.authentication.kafka;

import com.job.manager.dto.EmailVerifiedEvent;
import com.job.manager.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class KafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.register}")
    private String registerTopic;

    @Value("${kafka.topic.email-verified:email-verified}")
    private String emailVerifiedTopic;

    public KafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishRegisterEvent(RegisterRequest registerRequest) {
        kafkaTemplate.send(registerTopic, registerRequest);
    }

    public void publishEmailVerifiedEvent(EmailVerifiedEvent event) {
        kafkaTemplate.send(emailVerifiedTopic, event);
        System.out.println(">>> [KAFKA PRODUCER] Published email verification event for: " + event.getEmail());
    }
}