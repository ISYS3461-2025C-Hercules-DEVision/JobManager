package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponseDTO {
    
    private String transactionId;
    private String paymentUrl; // Redirect URL for Stripe Checkout
    private String sessionId; // Stripe Session ID
    private String status;
}
