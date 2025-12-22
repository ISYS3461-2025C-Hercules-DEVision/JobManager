package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionEventDTO {
    
    private String subscriptionId;
    private String companyId;
    private String planType;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private LocalDateTime timestamp;
    private String eventType; // "CREATED", "ACTIVATED", "EXPIRED", "CANCELLED"
}
