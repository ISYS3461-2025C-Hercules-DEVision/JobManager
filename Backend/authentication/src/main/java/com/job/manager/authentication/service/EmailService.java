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

        mailSender.send(message);
    }
}
