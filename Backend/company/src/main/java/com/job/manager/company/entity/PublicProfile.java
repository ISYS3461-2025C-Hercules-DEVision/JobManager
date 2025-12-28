package com.job.manager.company.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "public_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicProfile {

    @Id
    private String id;  // MongoDB auto-generated ID

    @Indexed(unique = true)
    private String companyId;  // UUID - same as Company.companyId (FK)

    private String displayName;

    private String aboutUs;

    private String whoWeAreLookingFor;

    private String websiteUrl;

    @Indexed
    private String industryDomain;

    private String logoUrl;

    private String bannerUrl;

    @Indexed
    private String country;

    private String city;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
