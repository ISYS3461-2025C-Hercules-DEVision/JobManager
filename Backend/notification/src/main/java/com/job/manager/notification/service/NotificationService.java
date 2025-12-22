package com.job.manager.notification.service;

import com.job.manager.notification.model.Notification;
import com.job.manager.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createApplicantMatchNotification(String companyId, String applicantId, String applicantName) {
        Notification notification = Notification.builder()
                .companyId(companyId)
                .applicantId(applicantId)
                .type("APPLICANT_MATCH")
                .title("New matching applicant found")
                .message("Applicant " + applicantName + " matches your search criteria.")
                .createdAt(Instant.now())
                .status("CREATED")
                .build();

        notificationRepository.save(notification);
    }
}