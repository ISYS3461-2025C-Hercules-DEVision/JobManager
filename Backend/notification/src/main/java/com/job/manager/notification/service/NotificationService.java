package com.job.manager.notification.service;

import com.job.manager.notification.dto.ApplicantMatchedEvent;

import com.job.manager.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    private String resolveCompanyEmail(String companyId) {
        return "khoa.nt200804@gmail.com";  // your test target
    }

    public void handleApplicantMatched(ApplicantMatchedEvent event) {

        String email = resolveCompanyEmail(event.getCompanyId());
        System.out.println("NotificationService: ABOUT TO SEND EMAIL to " + email);
        System.out.println("NotificationService: from = " + from);

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(email);
            mail.setSubject("New matching applicant: " + event.getApplicantName());
            mail.setText("An applicant matching your criteria has been found: " + event.getApplicantName());

            mailSender.send(mail);
            System.out.println("NotificationService: SENT EMAIL to " + email);
        } catch (Exception ex) {
            System.out.println("NotificationService: FAILED to send email: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}