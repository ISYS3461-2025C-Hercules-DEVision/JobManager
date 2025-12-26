package com.job.manager.payment.service;

import com.job.manager.payment.dto.PaymentInitiateRequestDTO;
import com.job.manager.payment.dto.PaymentInitiateResponseDTO;
import com.job.manager.payment.dto.PaymentResponseDTO;
import com.job.manager.payment.entity.PaymentTransaction;
import com.job.manager.payment.entity.PaymentTransaction.PaymentStatus;
import com.job.manager.payment.entity.PaymentTransaction.Subsystem;
import com.job.manager.payment.repository.PaymentTransactionRepository;
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

    @Value("${services.subscription.url}")
    private String subscriptionServiceUrl;

    @Value("${services.subscription.activate-endpoint}")
    private String subscriptionActivateEndpoint;

    public PaymentInitiateResponseDTO initiatePayment(PaymentInitiateRequestDTO request) {
        log.info("Initiating payment for {} subsystem", request.getSubsystem());

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
        log.info("Handling Job Manager payment success - activating subscription: {}", payment.getReferenceId());

        try {
            String endpoint = subscriptionActivateEndpoint.replace("{subscriptionId}", payment.getReferenceId());
            String url = subscriptionServiceUrl + endpoint + "?paymentId=" + payment.getTransactionId();

            WebClient webClient = webClientBuilder.build();
            webClient.put()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("Subscription activated successfully: {}", response),
                            error -> log.error("Failed to activate subscription: {}", error.getMessage())
                    );

        } catch (Exception e) {
            log.error("Error calling subscription service: {}", e.getMessage(), e);
            // Don't fail the payment - subscription activation can be retried
        }
    }

    private void handleJobApplicantPaymentSuccess(PaymentResponseDTO payment, String jwtToken) {
        log.info("Handling Job Applicant payment success - reference: {}", payment.getReferenceId());
        // TODO: Implement JA-specific callback when JA team provides their service endpoint
        // This could activate premium features, unlock content, etc.
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
                    Subsystem.valueOf(subsystem)
            );
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
}
