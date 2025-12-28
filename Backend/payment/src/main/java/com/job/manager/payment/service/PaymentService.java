package com.job.manager.payment.service;

import com.job.manager.payment.dto.PaymentInitiateRequestDTO;
import com.job.manager.payment.dto.PaymentInitiateResponseDTO;
import com.job.manager.payment.dto.PaymentResponseDTO;
import com.job.manager.payment.entity.PaymentTransaction;
import com.job.manager.payment.entity.PaymentTransaction.PaymentStatus;
import com.job.manager.payment.entity.PaymentTransaction.Subsystem;
import com.job.manager.payment.repository.PaymentTransactionRepository;
import com.job.manager.payment.validator.PaymentValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final StripePaymentService stripePaymentService;
    private final WebClient.Builder webClientBuilder;
    private final PaymentValidator paymentValidator;

    @Value("${services.subscription.url}")
    private String subscriptionServiceUrl;

    @Value("${services.subscription.activate-endpoint}")
    private String subscriptionActivateEndpoint;

    public PaymentInitiateResponseDTO initiatePayment(PaymentInitiateRequestDTO request) {
        log.info("Initiating payment for {} subsystem", request.getSubsystem());

        // VALIDATION: Apply all business rules before initiating payment
        paymentValidator.validatePaymentInitiation(request);

        // Route to appropriate gateway
        if ("STRIPE".equalsIgnoreCase(request.getGateway())) {
            return stripePaymentService.createCheckoutSession(request);
        } else {
            throw new IllegalArgumentException("Unsupported payment gateway: " + request.getGateway());
        }
    }

    public PaymentResponseDTO completePayment(String sessionId, String jwtToken) {
        log.info("Completing payment for session: {}", sessionId);

        // Handle successful payment
        PaymentResponseDTO payment = stripePaymentService.handleSuccessfulPayment(sessionId);

        // Route callback to appropriate service based on subsystem
        if ("JOB_MANAGER".equals(payment.getSubsystem())) {
            handleJobManagerPaymentSuccess(payment, jwtToken);
        } else if ("JOB_APPLICANT".equals(payment.getSubsystem())) {
            handleJobApplicantPaymentSuccess(payment, jwtToken);
        }

        return payment;
    }

    private void handleJobManagerPaymentSuccess(PaymentResponseDTO payment, String jwtToken) {
        // Only activate subscription for SUBSCRIPTION payment type
        if (!"SUBSCRIPTION".equals(payment.getPaymentType())) {
            log.info("Payment type is not SUBSCRIPTION, removing redundant check.");
            return;
        }

        log.info("Handling Job Manager payment success for reference: {}", payment.getReferenceId());

        // NOTE: Subscription activation is handled by Stripe Webhook (server-to-server)
        // via StripePaymentService.activateSubscriptionDirectly.
        // We do NOT need to call it again here to avoid double-charging or logic race
        // conditions.
        // If immediate feedback is needed before webhook arrives, the frontend should
        // poll the subscription status or we could check subscription status here.
        log.info("Subscription activation should be handled by Webhook. Verifying status via logs.");
    }

    private void handleJobApplicantPaymentSuccess(PaymentResponseDTO payment, String jwtToken) {
        log.info("Handling Job Applicant payment success - reference: {}", payment.getReferenceId());

        // PUBLISH EVENT for Job Applicant Service to consume
        // This is better than direct synchronous call if we want loose coupling
        // But for now, we just log implementation gap.

        // TODO: Call Job Applicant Service or publish specific "ApplicantUpgrade" event
        log.info(">>> [JOB APPLICANT] Payment received for applicant: {}", payment.getCustomerId());
        log.info(">>> [JOB APPLICANT] Should unlock premium features for reference: {}", payment.getReferenceId());
    }

    public PaymentResponseDTO getPaymentById(String transactionId) {
        PaymentTransaction transaction = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + transactionId));
        return mapToResponseDTO(transaction);
    }

    public PaymentResponseDTO getPaymentBySessionId(String sessionId) {
        PaymentTransaction transaction = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for session: " + sessionId));
        return mapToResponseDTO(transaction);
    }

    public List<PaymentResponseDTO> getPaymentsByCustomerId(String customerId, String subsystem) {
        List<PaymentTransaction> transactions;

        if (subsystem != null) {
            transactions = paymentRepository.findByCustomerIdAndSubsystem(
                    customerId,
                    Subsystem.valueOf(subsystem));
        } else {
            transactions = paymentRepository.findByCustomerId(customerId);
        }

        return transactions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
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
                transaction.getUpdatedAt());
    }
}
