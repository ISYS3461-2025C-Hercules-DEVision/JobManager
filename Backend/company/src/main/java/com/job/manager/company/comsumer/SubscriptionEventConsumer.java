package com.job.manager.company.comsumer;

import com.job.manager.company.dto.SubscriptionEventDTO;
import com.job.manager.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SubscriptionEventConsumer {

    private final CompanyService companyService;

    public SubscriptionEventConsumer(CompanyService companyService) {
        this.companyService = companyService;
        log.info(">>> SubscriptionEventConsumer bean created and ready to listen for subscription events!");
    }

    @KafkaListener(topics = "${kafka.topics.subscription-activated}", groupId = "company-consumer-group", containerFactory = "subscriptionKafkaListenerContainerFactory")
    public void consumeSubscriptionActivated(SubscriptionEventDTO event) {
        log.info(">>> [KAFKA CONSUMER] Received subscription-activated event: {}", event);

        try {
            // Fix: Log the incoming event detailed to debug
            log.info("Processing activation for company: {}, status: {}", event.getCompanyId(), event.getStatus());
            companyService.updatePremiumStatus(event.getCompanyId(), true);
            log.info(">>> [KAFKA CONSUMER] Successfully updated company {} to premium=true", event.getCompanyId());
        } catch (Exception e) {
            log.error(">>> [KAFKA CONSUMER] ERROR updating company premium status: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${kafka.topics.subscription-cancelled}", groupId = "company-consumer-group", containerFactory = "subscriptionKafkaListenerContainerFactory")
    public void consumeSubscriptionCancelled(SubscriptionEventDTO event) {
        log.info(">>> [KAFKA CONSUMER] Received subscription-cancelled event: {}", event);

        try {
            companyService.updatePremiumStatus(event.getCompanyId(), false);
            log.info(">>> [KAFKA CONSUMER] Successfully updated company {} to premium=false", event.getCompanyId());
        } catch (Exception e) {
            log.error(">>> [KAFKA CONSUMER] ERROR updating company premium status: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${kafka.topics.subscription-expired}", groupId = "company-consumer-group", containerFactory = "subscriptionKafkaListenerContainerFactory")
    public void consumeSubscriptionExpired(SubscriptionEventDTO event) {
        log.info(">>> [KAFKA CONSUMER] Received subscription-expired event: {}", event);

        try {
            companyService.updatePremiumStatus(event.getCompanyId(), false);
            log.info(">>> [KAFKA CONSUMER] Successfully updated company {} to premium=false (expired)",
                    event.getCompanyId());
        } catch (Exception e) {
            log.error(">>> [KAFKA CONSUMER] ERROR updating company premium status: {}", e.getMessage(), e);
        }
    }
}
