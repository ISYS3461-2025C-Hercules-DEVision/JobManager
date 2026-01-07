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
@Document(collection = "payment_transactions")
public class PaymentTransaction {

    @Id
    private String transactionId;
    
    // Subsystem routing
    private Subsystem subsystem; // JOB_MANAGER or JOB_APPLICANT
    private PaymentType paymentType; // SUBSCRIPTION, PREMIUM_FEATURE, ONE_TIME
    
    // Customer information
    private String customerId; // companyId for JM, applicantId for JA
    private String email; // Billing email
    
    // Reference to originating entity
    private String referenceId; // subscriptionId for JM, featureId for JA, etc.
    
    // Payment details
    private BigDecimal amount;
    private String currency;
    private PaymentGateway gateway;
    
    // Status tracking
    private PaymentStatus status;
    private LocalDateTime timestamp;
    
    // Gateway integration
    private String stripeSessionId; // Stripe Checkout Session ID
    private String stripePaymentIntentId; // Stripe Payment Intent ID
    private String rawGatewayRef; // Raw reference from gateway
    
    // Metadata
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Subsystem {
        JOB_MANAGER,
        JOB_APPLICANT
    }

    public enum PaymentType {
        SUBSCRIPTION,      // Monthly subscription (JM companies)
        PREMIUM_FEATURE,   // One-time premium feature (JA applicants)
        ONE_TIME          // Other one-time payments
    }

    public enum PaymentGateway {
        STRIPE,
        PAYPAL
    }

    public enum PaymentStatus {
        PENDING,    // Payment initiated, awaiting completion
        SUCCESS,    // Payment successful
        FAILED,     // Payment failed
        REFUNDED,   // Payment refunded
        CANCELLED   // Payment cancelled by user
    }
}
