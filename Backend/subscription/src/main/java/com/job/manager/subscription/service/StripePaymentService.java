package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.PaymentEventDTO;
import com.job.manager.subscription.dto.PaymentInitiateRequestDTO;
import com.job.manager.subscription.dto.PaymentInitiateResponseDTO;
import com.job.manager.subscription.dto.PaymentResponseDTO;
import com.job.manager.subscription.entity.PaymentTransaction;
import com.job.manager.subscription.kafka.PaymentEventProducer;
import com.job.manager.subscription.repository.PaymentTransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final PaymentEventProducer eventProducer;
    private final WebClient.Builder webClientBuilder;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @Value("${services.subscription.url}")
    private String subscriptionServiceUrl;

    @Value("${services.subscription.activate-endpoint}")
    private String subscriptionActivateEndpoint;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentInitiateResponseDTO createCheckoutSession(PaymentInitiateRequestDTO request) {
        log.info("Creating Stripe checkout session for customer: {}", request.getCustomerId());

        try {
            // Create payment transaction record
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setSubsystem(PaymentTransaction.Subsystem.valueOf(request.getSubsystem()));
            transaction.setPaymentType(PaymentTransaction.PaymentType.valueOf(request.getPaymentType()));
            transaction.setCustomerId(request.getCustomerId());
            transaction.setEmail(request.getEmail());
            transaction.setReferenceId(request.getReferenceId());
            transaction.setAmount(request.getAmount());
            transaction.setCurrency(request.getCurrency().toUpperCase());
            transaction.setGateway(PaymentTransaction.PaymentGateway.STRIPE);
            transaction.setStatus(PaymentTransaction.PaymentStatus.PENDING);
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

            if (transaction.getStatus() == PaymentTransaction.PaymentStatus.SUCCESS) {
                log.warn("Payment already processed for session: {}", sessionId);
                return mapToResponseDTO(transaction);
            }

            transaction.setStatus(PaymentTransaction.PaymentStatus.SUCCESS);
            transaction.setStripePaymentIntentId(session.getPaymentIntent());
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            PaymentTransaction updatedTransaction = paymentRepository.save(transaction);

            // Publish Kafka event
            PaymentEventDTO event = mapToEventDTO(updatedTransaction, "SUCCESS");
            eventProducer.sendPaymentSuccessEvent(event);

            // Activate subscription directly from webhook if payment type is SUBSCRIPTION
            if (updatedTransaction.getPaymentType() == PaymentTransaction.PaymentType.SUBSCRIPTION &&
                    updatedTransaction.getSubsystem() == PaymentTransaction.Subsystem.JOB_MANAGER) {
                try {
                    activateSubscriptionDirectly(updatedTransaction.getReferenceId(), updatedTransaction.getTransactionId());
                    log.info(">>> [WEBHOOK] Successfully activated subscription {} from webhook", updatedTransaction.getReferenceId());
                } catch (Exception e) {
                    log.error(">>> [WEBHOOK] Failed to activate subscription from webhook: {}", e.getMessage(), e);
                    // Don't fail the payment - subscription can be activated manually
                }
            }

            return mapToResponseDTO(updatedTransaction);

        } catch (StripeException e) {
            log.error("Stripe error retrieving session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve payment session: " + e.getMessage());
        }
    }

    // REMOVED: activateSubscription() method
    // Subscription activation is handled by PaymentService.completePayment()
    // which has access to the user's JWT token required for authentication

    public PaymentResponseDTO handleFailedPayment(String sessionId, String reason) {
        log.info("Handling failed payment for session: {}", sessionId);

        PaymentTransaction transaction = paymentRepository
                .findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found for session: " + sessionId));

        transaction.setStatus(PaymentTransaction.PaymentStatus.FAILED);
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
                // email intentionally excluded per SRS privacy requirements
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
    /**
     * Activate subscription directly without JWT (called from webhook)
     * Uses internal service-to-service communication
     */
    private void activateSubscriptionDirectly(String subscriptionId, String paymentId) {
        log.info(">>> [WEBHOOK] Activating subscription: {} with payment: {}", subscriptionId, paymentId);

        try {
            String endpoint = subscriptionActivateEndpoint.replace("{subscriptionId}", subscriptionId);
            String url = subscriptionServiceUrl + endpoint + "?paymentId=" + paymentId;

            WebClient webClient = webClientBuilder.build();
            String response = webClient.put()
                    .uri(url)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info(">>> [WEBHOOK] Subscription activated successfully: {}", response);

        } catch (Exception e) {
            log.error(">>> [WEBHOOK] Error calling subscription service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to activate subscription: " + e.getMessage());
        }
    }
}