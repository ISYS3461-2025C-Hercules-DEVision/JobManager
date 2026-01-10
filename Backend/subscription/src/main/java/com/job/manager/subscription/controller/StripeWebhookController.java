package com.job.manager.subscription.controller;

import com.job.manager.subscription.service.StripePaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Webhook controller for Stripe events.
 * Handles server-side payment confirmations from Stripe.
 * Verifies webhook signatures and processes events.
 */

// The STRIPE_WEBHOOK commnand to run is "stripe listen --forward-to localhost:8084/payments/webhook"
@RestController
public class StripeWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Autowired
    private StripePaymentService stripePaymentService;

    /**
     * Handle Stripe webhook events.
     * Verifies webhook signature and processes relevant events.
     * 
     * Supported events:
     * - checkout.session.completed: Payment successfully completed
     * - payment_intent.succeeded: Payment intent succeeded
     * - payment_intent.payment_failed: Payment failed
     * 
     * @param payload Raw webhook payload
     * @param sigHeader Stripe signature header
     * @return Response acknowledging webhook receipt
     */
    @PostMapping({"/webhook/stripe", "/payments/webhook"})
    public ResponseEntity<?> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader) {
        
        logger.info("Received Stripe webhook event");

        Event event;

        try {
            // Verify webhook signature
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("Webhook signature verified. Event type: {}", event.getType());

        } catch (SignatureVerificationException e) {
            logger.error("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid signature"));
        } catch (Exception e) {
            logger.error("Error parsing webhook event: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid payload"));
        }

        // Handle the event based on type
        try {
            switch (event.getType()) {
                case "checkout.session.completed":
                    handleCheckoutSessionCompleted(event, payload);
                    break;

                case "payment_intent.succeeded":
                    handlePaymentIntentSucceeded(event);
                    break;

                case "payment_intent.payment_failed":
                    handlePaymentIntentFailed(event);
                    break;

                default:
                    logger.info("Unhandled event type: {}", event.getType());
            }

            // Return 200 to acknowledge receipt
            return ResponseEntity.ok(Map.of("received", true));

        } catch (Exception e) {
            logger.error("Error handling webhook event: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process event"));
        }
    }

    /**
     * Handle checkout.session.completed event.
     * Triggered when a Checkout Session is successfully completed.
     * 
     * @param event Stripe event
     * @param payload Raw JSON payload
     */
    private void handleCheckoutSessionCompleted(Event event, String payload) {
        try {
            // Extract session ID from raw JSON payload
            // Find the "id" field within "data.object"
            String sessionId = extractJsonValue(payload, "\"id\":\\s*\"(cs_[^\"]+)\"");
            
            if (sessionId == null) {
                throw new IllegalStateException("Could not extract session ID from webhook payload");
            }
            
            // Retrieve full session details from Stripe API
            Session session = Session.retrieve(sessionId);
            String paymentStatus = session.getPaymentStatus();

            logger.info("Checkout session completed: {}, payment status: {}", sessionId, paymentStatus);

            if ("paid".equals(paymentStatus)) {
                // Mark payment as successful
                stripePaymentService.handleSuccessfulPayment(sessionId);

                logger.info("Payment marked as successful for session: {}", sessionId);
            } else {
                logger.warn("Checkout session completed but payment not paid. Session: {}, Status: {}", 
                        sessionId, paymentStatus);
            }

        } catch (Exception e) {
            logger.error("Error handling checkout.session.completed event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to handle checkout session completed", e);
        }
    }
    
    /**
     * Extract a value from JSON using regex
     */
    private String extractJsonValue(String json, String pattern) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    /**
     * Handle payment_intent.succeeded event.
     * Triggered when a PaymentIntent successfully completes.
     * 
     * @param event Stripe event
     */
    private void handlePaymentIntentSucceeded(Event event) {
        try {
            com.stripe.model.PaymentIntent paymentIntent = 
                    (com.stripe.model.PaymentIntent) event.getDataObjectDeserializer()
                            .getObject()
                            .orElseThrow(() -> new IllegalStateException("Unable to deserialize event"));

            String paymentIntentId = paymentIntent.getId();
            String status = paymentIntent.getStatus();

            logger.info("Payment intent succeeded: {}, status: {}", paymentIntentId, status);

            // Additional handling if needed
            // Most cases are already handled by checkout.session.completed

        } catch (Exception e) {
            logger.error("Error handling payment_intent.succeeded event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle payment_intent.payment_failed event.
     * Triggered when a PaymentIntent fails.
     * 
     * @param event Stripe event
     */
    private void handlePaymentIntentFailed(Event event) {
        try {
            com.stripe.model.PaymentIntent paymentIntent = 
                    (com.stripe.model.PaymentIntent) event.getDataObjectDeserializer()
                            .getObject()
                            .orElseThrow(() -> new IllegalStateException("Unable to deserialize event"));

            String paymentIntentId = paymentIntent.getId();
            String failureMessage = paymentIntent.getLastPaymentError() != null 
                    ? paymentIntent.getLastPaymentError().getMessage() 
                    : "Unknown error";

            logger.error("Payment intent failed: {}, reason: {}", paymentIntentId, failureMessage);

            // Mark payment as failed
            // Need to find payment by paymentIntentId
            // TODO: Implement failure handling logic

        } catch (Exception e) {
            logger.error("Error handling payment_intent.payment_failed event: {}", e.getMessage(), e);
        }
    }

    /**
     * Health check endpoint for webhook.
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "stripe-webhook",
                "webhookSecretConfigured", webhookSecret != null && !webhookSecret.isEmpty()
        ));
    }
}
