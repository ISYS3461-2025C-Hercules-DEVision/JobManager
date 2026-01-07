package com.job.manager.subscription.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateRequestDTO {
    
    @NotNull(message = "Subsystem is required")
    private String subsystem; // "JOB_MANAGER" or "JOB_APPLICANT"
    
    @NotNull(message = "Payment type is required")
    private String paymentType; // "SUBSCRIPTION", "PREMIUM_FEATURE", "ONE_TIME"
    
    @NotNull(message = "Customer ID is required")
    private String customerId; // companyId or applicantId
    
    @NotNull(message = "Email is required")
    private String email;
    
    @NotNull(message = "Reference ID is required")
    private String referenceId; // subscriptionId, featureId, etc.
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Currency is required")
    private String currency; // "USD", "EUR", etc.
    
    @NotNull(message = "Gateway is required")
    private String gateway; // "STRIPE" or "PAYPAL"
    
    private String description; // Optional description
}
