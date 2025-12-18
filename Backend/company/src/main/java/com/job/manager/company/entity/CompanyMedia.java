package com.job.manager.company.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "company_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMedia {

    @Id
    private String mediaId;  // UUID

    @Indexed
    private String companyId;  // UUID - FK to Company

    private String url;  // URL to media file (S3/Minio)

    private MediaType mediaType;  // enum: image, video

    private String title;

    private String description;

    private Integer orderIndex;  // Display order

    private Boolean isActive;

    private LocalDateTime uploadedAt;

    public enum MediaType {
        IMAGE,
        VIDEO
    }
}
