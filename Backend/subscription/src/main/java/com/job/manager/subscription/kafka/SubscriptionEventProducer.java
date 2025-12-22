package com.job.manager.subscription.kafka;

import com.job.manager.subscription.dto.SubscriptionEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionEventProducer {

    private final KafkaTemplate<String, SubscriptionEventDTO> kafkaTemplate;

    @Value("${kafka.topics.subscription-created}")
    private String subscriptionCreatedTopic;

    @Value("${kafka.topics.subscription-activated}")
    private String subscriptionActivatedTopic;

    @Value("${kafka.topics.subscription-expired}")
    private String subscriptionExpiredTopic;

    @Value("${kafka.topics.subscription-cancelled}")
    private String subscriptionCancelledTopic;

    public void sendSubscriptionCreatedEvent(SubscriptionEventDTO event) {
        log.info("Sending subscription created event: {}", event);
        kafkaTemplate.send(subscriptionCreatedTopic, event.getCompanyId(), event);
    }

    public void sendSubscriptionActivatedEvent(SubscriptionEventDTO event) {
        log.info("Sending subscription activated event: {}", event);
        kafkaTemplate.send(subscriptionActivatedTopic, event.getCompanyId(), event);
    }

    public void sendSubscriptionExpiredEvent(SubscriptionEventDTO event) {
        log.info("Sending subscription expired event: {}", event);
        kafkaTemplate.send(subscriptionExpiredTopic, event.getCompanyId(), event);
    }

    public void sendSubscriptionCancelledEvent(SubscriptionEventDTO event) {
        log.info("Sending subscription cancelled event: {}", event);
        kafkaTemplate.send(subscriptionCancelledTopic, event.getCompanyId(), event);
    }
}
