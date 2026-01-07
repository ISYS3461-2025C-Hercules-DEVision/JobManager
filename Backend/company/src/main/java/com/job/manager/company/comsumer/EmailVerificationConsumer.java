package com.job.manager.company.comsumer;

import com.job.manager.company.service.CompanyService;
import com.job.manager.dto.EmailVerifiedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationConsumer {

    @Autowired
    private CompanyService companyService;

    @KafkaListener(topics = "${kafka.topic.email-verified}", groupId = "company-consumer-group")
    public void consume(EmailVerifiedEvent event) {
        System.out.println(">>> [KAFKA CONSUMER] Received email verification event: " + event);
        System.out.println(">>> [KAFKA CONSUMER] Email: " + event.getEmail());
        System.out.println(">>> [KAFKA CONSUMER] Verified: " + event.getIsVerified());
        
        try {
            companyService.updateEmailVerificationStatus(event.getEmail(), event.getIsVerified());
            System.out.println(">>> [KAFKA CONSUMER] Successfully updated email verification status");
        } catch (Exception e) {
            System.err.println(">>> [KAFKA CONSUMER] ERROR updating email verification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
