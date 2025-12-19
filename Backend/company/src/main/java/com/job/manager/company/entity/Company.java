package com.job.manager.company.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    private String companyId;  // UUID

    private String companyName;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;  // Can be null for SSO accounts

    private String phoneNumber;

    private String streetAddress;

    private String city;

    @Indexed
    private String country;  // Shard key

    private String shardKey;  // Set to country value

    private Boolean isEmailVerified;

    private Boolean isActive;

    private SsoProvider ssoProvider;  // enum: local, google, microsoft, facebook, github

    private String ssoId;  // SSO provider ID

    private Boolean isPremium;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum SsoProvider {
        LOCAL,
        GOOGLE,
        MICROSOFT,
        FACEBOOK,
        GITHUB
    }
}