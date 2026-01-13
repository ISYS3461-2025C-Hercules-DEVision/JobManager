package com.job.manager.authentication.model;

import com.job.manager.authentication.constants.AccountStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username; // or email

    private String password; // hashed

    private Boolean isVerified;

    private Date verifiedAt;

    private String provider;
    private String providerId;
    
    private Boolean hasPublicProfile; // true if user has completed public profile setup

    private AccountStatus status = AccountStatus.ACTIVE;
}
