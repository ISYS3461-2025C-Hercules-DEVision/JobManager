package com.job.manager.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;   // ✅ PUT IT HERE (class field)

    public void sendVerificationEmail(String to, String code) {

        // Local/dev convenience: allow running without SMTP configured.
        // If SMTP is not set up, log the OTP so developers can continue the flow.
        if (from == null || from.isBlank()) {
            System.out.println("[WARN] SMTP not configured (spring.mail.username is empty). OTP for " + to + ": " + code);
            return;
        }

        String subject = "Your verification code";

        String body = """
        Welcome!

        Your email verification code is:

        %s

        This code expires in 10 minutes.
        """.formatted(code);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);   // ✅ USE IT HERE
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            // Don't fail registration due to SMTP issues in local/dev.
            System.out.println("[WARN] Failed to send email via SMTP. OTP for " + to + ": " + code + ". Error: " + ex.getMessage());
        }
    }
}
