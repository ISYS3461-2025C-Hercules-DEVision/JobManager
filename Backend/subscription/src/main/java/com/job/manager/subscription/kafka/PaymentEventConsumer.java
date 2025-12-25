package com.job.manager.subscription.kafka;

import com.job.manager.subscription.dto.PaymentEventDTO;
import com.job.manager.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final SubscriptionService subscriptionService;

    @KafkaListener(topics = "${kafka.topics.payment-failed}", groupId = "subscription-consumer-group")
    public void consumePaymentFailed(PaymentEventDTO event) {
        log.info(">>> [KAFKA CONSUMER] Received payment-failed event: {}", event);
        
        // Only handle subscription payment failures
        if (!"SUBSCRIPTION".equals(event.getPaymentType())) {
            log.info(">>> [KAFKA CONSUMER] Payment type is not SUBSCRIPTION, skipping");
            return;
        }
        
        try {
            // referenceId contains subscriptionId for subscription payments
            String subscriptionId = event.getReferenceId();
            subscriptionService.cancelSubscription(subscriptionId);
            log.info(">>> [KAFKA CONSUMER] Successfully cancelled subscription {} due to payment failure", subscriptionId);
        } catch (Exception e) {
            log.error(">>> [KAFKA CONSUMER] ERROR cancelling subscription: {}", e.getMessage(), e);
        }
    }
}
