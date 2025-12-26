package com.job.manager.authentication.kafka;

import com.job.manager.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class KafkaProducer {

    private final KafkaTemplate<String, RegisterRequest> kafkaTemplate;

    @Value("${kafka.topic.register}")
    private String registerTopic;

    public KafkaProducer(KafkaTemplate<String, RegisterRequest> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishRegisterEvent(RegisterRequest registerRequest) {
        System.out.println(">>> [KAFKA PRODUCER] Publishing registration event to topic: " + registerTopic);
        System.out.println(">>> [KAFKA PRODUCER] CompanyId: " + registerRequest.getCompanyId());
        System.out.println(">>> [KAFKA PRODUCER] Email: " + registerRequest.getEmail());
        System.out.println(">>> [KAFKA PRODUCER] CompanyName: " + registerRequest.getCompanyName());
        
        kafkaTemplate.send(registerTopic, registerRequest);
        
        System.out.println(">>> [KAFKA PRODUCER] Event published successfully");
    }
}