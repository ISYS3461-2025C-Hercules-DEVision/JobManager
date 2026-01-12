package com.job.manager.notification.kafka;

import com.job.manager.notification.dto.SubscriptionEventDTO;
import com.job.manager.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationKafkaListener {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = {
                "subscription-created",
                "subscription-activated",
                "subscription-expired",
                "subscription-cancelled",
                "subscription-expiring-soon"
            },
            groupId = "notification-group",
            containerFactory = "subscriptionKafkaListenerContainerFactory"
    )
    public void onSubscriptionEvent(SubscriptionEventDTO event) {
        System.out.println("NotificationKafkaListener: received subscription event: " + event);
        // You can add logic here to handle different event types if needed
        // e.g., notificationService.handleSubscriptionEvent(event);
    }
}