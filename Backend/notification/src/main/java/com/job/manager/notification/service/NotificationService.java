package com.job.manager.notification.service;

import com.job.manager.notification.client.CompanyEmailClient;
import com.job.manager.notification.dto.ApplicantMatchedEvent;
import com.job.manager.notification.model.Notification;
import com.job.manager.notification.repository.NotificationRepository;
import com.job.manager.notification.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final CompanyEmailClient companyEmailClient;
    private final NotificationWebSocketHandler webSocketHandler;

    @Value("${SMTP_EMAIL:}")
    private String from;

    private String resolveCompanyEmail(String companyId) {
        return companyEmailClient.getCompanyEmail(companyId);
    }

    public void handleApplicantMatched(ApplicantMatchedEvent event) {

        // 1. Save notification to Mongo
        Notification notification = Notification.builder()
                .companyId(event.getCompanyId())
                .applicantId(event.getApplicantId())
                .applicantName(event.getApplicantName())
                .subject("New matching applicant: " + event.getApplicantName())
                .message("An applicant matching your criteria has been found: " + event.getApplicantName())
                .read(false)
                .createdAt(Instant.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        System.out.println("NotificationService: Saved notification to MongoDB: " + savedNotification.getId());

        // 2. Send real-time WebSocket notification to company
        try {
            webSocketHandler.sendNotificationToCompany(event.getCompanyId(), savedNotification);
            System.out.println("NotificationService: Sent WebSocket notification to company: " + event.getCompanyId());
        } catch (Exception ex) {
            System.out.println("NotificationService: Failed to send WebSocket notification: " + ex.getMessage());
        }

        // 3. Resolve email and send email notification
        String email = resolveCompanyEmail(event.getCompanyId());
        System.out.println("NotificationService: ABOUT TO SEND EMAIL to " + email);
        System.out.println("NotificationService: from = " + from);

        if (from == null || from.isBlank()) {
            System.out.println("NotificationService: SMTP not configured (SMTP_EMAIL missing). Skipping email send.");
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(email);
            mail.setSubject(notification.getSubject());   // <-- no ellipsis
            mail.setText(notification.getMessage());      // <-- no ellipsis

            mailSender.send(mail);
            System.out.println("NotificationService: SENT EMAIL to " + email);
        } catch (Exception ex) {
            System.out.println("NotificationService: FAILED to send email: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}