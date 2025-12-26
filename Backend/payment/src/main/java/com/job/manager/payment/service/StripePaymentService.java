package com.job.manager.payment.service;

import com.job.manager.payment.dto.PaymentEventDTO;
import com.job.manager.payment.dto.PaymentInitiateRequestDTO;
import com.job.manager.payment.dto.PaymentInitiateResponseDTO;
import com.job.manager.payment.dto.PaymentResponseDTO;
import com.job.manager.payment.entity.PaymentTransaction;
import com.job.manager.payment.entity.PaymentTransaction.*;
import com.job.manager.payment.kafka.PaymentEventProducer;
import com.job.manager.payment.repository.PaymentTransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final PaymentEventProducer eventProducer;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentInitiateResponseDTO createCheckoutSession(PaymentInitiateRequestDTO request) {
        log.info("Creating Stripe checkout session for customer: {}", request.getCustomerId());

        try {
            // Create payment transaction record
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setSubsystem(Subsystem.valueOf(request.getSubsystem()));
            transaction.setPaymentType(PaymentType.valueOf(request.getPaymentType()));
            transaction.setCustomerId(request.getCustomerId());
            transaction.setEmail(request.getEmail());
            transaction.setReferenceId(request.getReferenceId());
            transaction.setAmount(request.getAmount());
            transaction.setCurrency(request.getCurrency().toUpperCase());
            transaction.setGateway(PaymentGateway.STRIPE);
            transaction.setStatus(PaymentStatus.PENDING);
            transaction.setDescription(request.getDescription());
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            PaymentTransaction savedTransaction = paymentRepository.save(transaction);

            // Create Stripe Checkout Session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .setCustomerEmail(request.getEmail())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency(request.getCurrency().toLowerCase())
                                                    .setUnitAmount(request.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue()) // Convert to cents
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(request.getDescription() != null ? request.getDescription() : "Payment")
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .putMetadata("transactionId", savedTransaction.getTransactionId())
                    .putMetadata("customerId", request.getCustomerId())
                    .putMetadata("subsystem", request.getSubsystem())
                    .putMetadata("referenceId", request.getReferenceId())
                    .build();

            Session session = Session.create(params);

            // Update transaction with Stripe session ID
            savedTransaction.setStripeSessionId(session.getId());
            savedTransaction.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(savedTransaction);

            // Publish Kafka event
            PaymentEventDTO event = mapToEventDTO(savedTransaction, "INITIATED");
            eventProducer.sendPaymentInitiatedEvent(event);

            return new PaymentInitiateResponseDTO(
                    savedTransaction.getTransactionId(),
                    session.getUrl(),
                    session.getId(),
                    "PENDING"
            );

        } catch (StripeException e) {
            log.error("Stripe error creating checkout session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment session: " + e.getMessage());
        }
    }

    public PaymentResponseDTO handleSuccessfulPayment(String sessionId) {
        log.info("Handling successful payment for session: {}", sessionId);

        try {
            Session session = Session.retrieve(sessionId);

            PaymentTransaction transaction = paymentRepository
                    .findByStripeSessionId(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("Transaction not found for session: " + sessionId));

            if (transaction.getStatus() == PaymentStatus.SUCCESS) {
                log.warn("Payment already processed for session: {}", sessionId);
                return mapToResponseDTO(transaction);
            }

            transaction.setStatus(PaymentStatus.SUCCESS);
            transaction.setStripePaymentIntentId(session.getPaymentIntent());
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            PaymentTransaction updatedTransaction = paymentRepository.save(transaction);

            // Publish Kafka event
            PaymentEventDTO event = mapToEventDTO(updatedTransaction, "SUCCESS");
            eventProducer.sendPaymentSuccessEvent(event);

            return mapToResponseDTO(updatedTransaction);

        } catch (StripeException e) {
            log.error("Stripe error retrieving session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve payment session: " + e.getMessage());
        }
    }

    public PaymentResponseDTO handleFailedPayment(String sessionId, String reason) {
        log.info("Handling failed payment for session: {}", sessionId);

        PaymentTransaction transaction = paymentRepository
                .findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found for session: " + sessionId));

        transaction.setStatus(PaymentStatus.FAILED);
        transaction.setDescription(transaction.getDescription() + " | Failure reason: " + reason);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        PaymentTransaction updatedTransaction = paymentRepository.save(transaction);

        // Publish Kafka event
        PaymentEventDTO event = mapToEventDTO(updatedTransaction, "FAILED");
        eventProducer.sendPaymentFailedEvent(event);

        return mapToResponseDTO(updatedTransaction);
    }

    private PaymentResponseDTO mapToResponseDTO(PaymentTransaction transaction) {
        return new PaymentResponseDTO(
                transaction.getTransactionId(),
                transaction.getSubsystem().toString(),
                transaction.getPaymentType().toString(),
                transaction.getCustomerId(),
                transaction.getEmail(),
                transaction.getReferenceId(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getGateway().toString(),
                transaction.getStatus().toString(),
                transaction.getTimestamp(),
                transaction.getDescription(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }

    private PaymentEventDTO mapToEventDTO(PaymentTransaction transaction, String eventType) {
        return new PaymentEventDTO(
                transaction.getTransactionId(),
                transaction.getSubsystem().toString(),
                transaction.getPaymentType().toString(),
                transaction.getCustomerId(),
                transaction.getReferenceId(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getGateway().toString(),
                transaction.getStatus().toString(),
                LocalDateTime.now(),
                eventType
        );
    }
}
