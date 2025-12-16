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

    @KafkaListener(topics = "${kafka.topic.register}", groupId = "authentication-consumer-group")
    public void consume(RegisterRequest request) {
        System.out.println("Received registration event: " + request);
        companyService.registerProfile(request);
    }
}
