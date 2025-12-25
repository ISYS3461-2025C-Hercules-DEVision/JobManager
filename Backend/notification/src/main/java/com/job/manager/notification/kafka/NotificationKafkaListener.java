package com.job.manager.notification.kafka;

import com.job.manager.notification.dto.ApplicantMatchedEvent;
import com.job.manager.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationKafkaListener {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "applicant.matches",
            groupId = "notification-group",
            containerFactory = "matchedKafkaListenerContainerFactory"
    )
    public void onApplicantMatched(ApplicantMatchedEvent event) {
        System.out.println("NotificationKafkaListener: received matched event: " + event);
        try {
            notificationService.handleApplicantMatched(event);
        } catch (Exception ex) {
            System.out.println("NotificationKafkaListener: ERROR handling event: " + ex.getMessage());
            ex.printStackTrace();
            // Optionally rethrow, Kafka will still log it:
            throw ex;
        }
    }
}