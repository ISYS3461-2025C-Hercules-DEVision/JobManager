package com.job.manager.authentication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "refresh_tokens")
public class RefreshToken {
    
    @Id
    private String id;
    
    private String token; // Hashed refresh token
    
    private String userId;
    
    private LocalDateTime expiresAt;
    
    private boolean isRevoked;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime revokedAt;
}
