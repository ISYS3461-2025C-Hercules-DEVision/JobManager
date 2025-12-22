package com.job.manager.payment.controller;

import com.job.manager.payment.dto.PaymentInitiateRequestDTO;
import com.job.manager.payment.dto.PaymentInitiateResponseDTO;
import com.job.manager.payment.dto.PaymentResponseDTO;
import com.job.manager.payment.service.PaymentService;
import com.job.manager.payment.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for payment operations.
 * Handles payment initiation, completion, and history retrieval.
 * Supports both Job Manager (JM) and Job Applicant (JA) subsystems.
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Initiate a new payment.
     * Creates a Stripe Checkout Session and returns the URL for user redirect.
     * 
     * Request body must include:
     * - subsystem: JOB_MANAGER or JOB_APPLICANT
     * - paymentType: SUBSCRIPTION, PREMIUM_FEATURE, or ONE_TIME
     * - customerId, email, referenceId, amount, currency
     * 
     * @param request Payment initiation details
     * @param token JWT token from Authorization header
     * @return Payment initiate response with Stripe checkout URL
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequestDTO request,
            @RequestHeader("Authorization") String token) {
        
        try {
            logger.info("Payment initiation request for subsystem: {}, type: {}, customer: {}", 
                    request.getSubsystem(), request.getPaymentType(), request.getCustomerId());

            // Validate JWT token
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtil.validateToken(jwtToken)) {
                logger.warn("Invalid JWT token for payment initiation");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            // Initiate payment
            PaymentInitiateResponseDTO response = paymentService.initiatePayment(request);
            
            logger.info("Payment initiated successfully. Transaction ID: {}, Session ID: {}", 
                    response.getTransactionId(), response.getStripeSessionId());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid payment initiation request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error initiating payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to initiate payment: " + e.getMessage()));
        }
    }

    /**
     * Complete a payment after Stripe redirect.
     * Called by frontend after user completes payment on Stripe.
     * Updates transaction status and triggers callbacks to appropriate service.
     * 
     * @param sessionId Stripe session ID from success URL
     * @param token JWT token from Authorization header
     * @return Completed payment details
     */
    @GetMapping("/complete")
    public ResponseEntity<?> completePayment(
            @RequestParam String sessionId,
            @RequestHeader("Authorization") String token) {
        
        try {
            logger.info("Payment completion request for session: {}", sessionId);

            // Validate JWT token
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtil.validateToken(jwtToken)) {
                logger.warn("Invalid JWT token for payment completion");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            // Complete payment and trigger callbacks
            PaymentResponseDTO response = paymentService.completePayment(sessionId, jwtToken);
            
            logger.info("Payment completed successfully. Transaction ID: {}, Status: {}", 
                    response.getTransactionId(), response.getStatus());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid payment completion request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error completing payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to complete payment: " + e.getMessage()));
        }
    }

    /**
     * Get payment details by transaction ID.
     * 
     * @param transactionId Payment transaction ID
     * @param token JWT token from Authorization header
     * @return Payment details
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable String transactionId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate JWT token
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtil.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            PaymentResponseDTO payment = paymentService.getPaymentById(transactionId);
            
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(payment);

        } catch (Exception e) {
            logger.error("Error retrieving payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payment"));
        }
    }

    /**
     * Get payment history for a specific customer.
     * 
     * @param customerId Customer ID (companyId or applicantId)
     * @param token JWT token from Authorization header
     * @return List of customer payments
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerPayments(
            @PathVariable String customerId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate JWT token
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtil.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            List<PaymentResponseDTO> payments = paymentService.getPaymentsByCustomerId(customerId);
            
            logger.info("Retrieved {} payments for customer: {}", payments.size(), customerId);

            return ResponseEntity.ok(payments);

        } catch (Exception e) {
            logger.error("Error retrieving customer payments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve customer payments"));
        }
    }

    /**
     * Get all payments (admin only).
     * 
     * @param token JWT token from Authorization header
     * @return List of all payments
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate JWT token
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtil.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            // TODO: Add role-based authorization check (admin only)
            
            List<PaymentResponseDTO> payments = paymentService.getAllPayments();
            
            logger.info("Retrieved {} total payments", payments.size());

            return ResponseEntity.ok(payments);

        } catch (Exception e) {
            logger.error("Error retrieving all payments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payments"));
        }
    }

    /**
     * Cancel URL handler.
     * Called when user cancels payment on Stripe.
     * 
     * @param sessionId Stripe session ID
     * @return Cancellation acknowledgment
     */
    @GetMapping("/cancel")
    public ResponseEntity<?> handlePaymentCancellation(@RequestParam String sessionId) {
        
        try {
            logger.info("Payment cancelled for session: {}", sessionId);

            // Update payment status to CANCELLED
            PaymentResponseDTO payment = paymentService.getPaymentBySessionId(sessionId);
            
            if (payment != null) {
                // Payment exists, could update status here
                Map<String, String> response = new HashMap<>();
                response.put("message", "Payment cancelled");
                response.put("transactionId", payment.getTransactionId());
                response.put("status", "CANCELLED");
                
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.ok(Map.of("message", "Payment cancellation acknowledged"));

        } catch (Exception e) {
            logger.error("Error handling payment cancellation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to handle cancellation"));
        }
    }
}
