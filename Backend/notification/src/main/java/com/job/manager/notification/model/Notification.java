package com.job.manager.notification.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String companyId;
    private String applicantId;

    private String type;      // "APPLICANT_MATCH"
    private String title;
    private String message;

    private Instant createdAt;
    private String status;    // "CREATED" for now
}