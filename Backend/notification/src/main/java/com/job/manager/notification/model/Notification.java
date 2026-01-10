package com.job.manager.notification.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String companyId;
    private String applicantId;
    private String applicantName;

    private String subject;
    private String message;

    private boolean read;

    private Instant createdAt;
}