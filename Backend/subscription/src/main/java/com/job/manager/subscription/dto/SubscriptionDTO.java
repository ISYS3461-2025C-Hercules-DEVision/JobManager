package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for subscription information received from the subscription service.
 * Used to validate subscription existence and retrieve subscription details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {

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
