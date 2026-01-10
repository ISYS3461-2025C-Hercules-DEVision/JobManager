package com.job.manager.subscription.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subscriptions")
public class Subscription {

    @Id
    private String subscriptionId;
    
    private String companyId;
    
    private PlanType planType;
    
    private BigDecimal priceAmount;
    
    private String currency;
    
    private LocalDateTime startDate;
    
    private LocalDateTime expiryDate;
    
    private SubscriptionStatus status;
    
    private String lastPaymentId;
    
    private Boolean autoRenew;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    public enum PlanType {
        FREE,
        PREMIUM
    }

    public enum SubscriptionStatus {
        PENDING,
        ACTIVE,
        EXPIRED,
        CANCELLED
    }
}
