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
        System.out.println("NotificationService: received matched event: " + event);
        notificationService.handleApplicantMatched(event);
    }
}