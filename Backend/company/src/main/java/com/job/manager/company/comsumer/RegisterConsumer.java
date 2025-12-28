package com.job.manager.company.comsumer;

import com.job.manager.company.service.CompanyService;
import com.job.manager.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class RegisterConsumer {

    @Autowired
    private CompanyService companyService;

    @KafkaListener(topics = "${kafka.topic.register}", groupId = "company-consumer-group")
    public void consume(RegisterRequest request) {
        System.out.println(">>> [KAFKA CONSUMER] Received registration event: " + request);
        System.out.println(">>> [KAFKA CONSUMER] CompanyId: " + request.getCompanyId());
        System.out.println(">>> [KAFKA CONSUMER] Email: " + request.getEmail());
        System.out.println(">>> [KAFKA CONSUMER] CompanyName: " + request.getCompanyName());
        
        try {
            companyService.registerProfile(request);
            System.out.println(">>> [KAFKA CONSUMER] Successfully created company profile");
        } catch (Exception e) {
            System.err.println(">>> [KAFKA CONSUMER] ERROR creating company profile: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
