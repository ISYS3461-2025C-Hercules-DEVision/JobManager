package com.job.manager.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    
    private String transactionId;
    private String subsystem;
    private String paymentType;
    private String customerId;
    // email removed per SRS DM-07: "Not in public receipts; used only for reconciliation / invoicing"
    private String referenceId;
    private BigDecimal amount;
    private String currency;
    private String gateway;
    private String status;
    private LocalDateTime timestamp;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
