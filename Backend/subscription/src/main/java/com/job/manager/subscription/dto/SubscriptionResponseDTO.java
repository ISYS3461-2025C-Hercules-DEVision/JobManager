package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponseDTO {
    
    private String subscriptionId;
    private String companyId;
    private String planType;
    private BigDecimal priceAmount;
    private String currency;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private String status;
    private String lastPaymentId;
    private Boolean autoRenew;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
