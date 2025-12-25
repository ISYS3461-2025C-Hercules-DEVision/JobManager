package com.job.manager.notification;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class NotificationApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(e -> {
            String key = e.getKey();
            String value = e.getValue();

            // Normalize only the SMTP password: remove spaces
            if ("SMTP_PASSWORD".equals(key) && value != null) {
                String normalized = value.replace(" ", "");
                System.setProperty(key, normalized);
            } else {
                System.setProperty(key, value);
            }
        });

        SpringApplication.run(NotificationApplication.class, args);
    }

    @PostConstruct
    public void logSmtpProps() {
        System.out.println("=== NotificationApplication SMTP DEBUG ===");
        System.out.println("System property SMTP_EMAIL = " + System.getProperty("SMTP_EMAIL"));
        String pwd = System.getProperty("SMTP_PASSWORD");
        System.out.println("System property SMTP_PASSWORD length = " + (pwd == null ? "null" : pwd.length()));
    }
}