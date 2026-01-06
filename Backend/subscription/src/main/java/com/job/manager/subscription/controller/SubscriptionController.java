package com.job.manager.subscription.controller;

import com.job.manager.subscription.dto.SubscriptionCreateDTO;
import com.job.manager.subscription.dto.SubscriptionResponseDTO;
import com.job.manager.subscription.service.SubscriptionService;
import com.job.manager.subscription.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<SubscriptionResponseDTO> createSubscription(
            @Valid @RequestBody SubscriptionCreateDTO dto,
            @RequestHeader("Authorization") String token) {

        log.info("Creating subscription for company: {}", dto.getCompanyId());

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Validation and error handling is now managed by GlobalExceptionHandler
        SubscriptionResponseDTO response = subscriptionService.createSubscription(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<SubscriptionResponseDTO> getSubscriptionByCompanyId(
            @PathVariable String companyId,
            @RequestHeader("Authorization") String token) {

        log.info("Getting subscription for company: {}", companyId);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.getSubscriptionByCompanyId(companyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Subscription not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Internal endpoint for service-to-service calls (no authentication required)
    @GetMapping("/internal/{subscriptionId}")
    public ResponseEntity<SubscriptionResponseDTO> getSubscriptionByIdInternal(
            @PathVariable String subscriptionId) {

        log.info("Internal call - Getting subscription: {}", subscriptionId);

        try {
            SubscriptionResponseDTO response = subscriptionService.getSubscriptionById(subscriptionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Subscription not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{subscriptionId}")
    public ResponseEntity<SubscriptionResponseDTO> getSubscriptionById(
            @PathVariable String subscriptionId,
            @RequestHeader("Authorization") String token) {

        log.info("Getting subscription: {}", subscriptionId);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.getSubscriptionById(subscriptionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Subscription not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponseDTO>> getAllSubscriptions(
            @RequestHeader("Authorization") String token) {

        log.info("Getting all subscriptions");

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SubscriptionResponseDTO> response = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{subscriptionId}/activate")
    public ResponseEntity<SubscriptionResponseDTO> activateSubscription(
            @PathVariable String subscriptionId,
            @RequestParam String paymentId,
            @RequestHeader(value = "Authorization", required = false) String token) {

        log.info("Activating subscription: {} with payment: {}", subscriptionId, paymentId);

        // Validate JWT token if provided (optional for internal service calls)
        if (token != null && !token.isEmpty()) {
            try {
                String jwt = token.replace("Bearer ", "");
                jwtUtil.validateToken(jwt);
            } catch (Exception e) {
                log.error("Invalid JWT token", e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } else {
            log.info(">>> [INTERNAL] Activation called without token (internal service call)");
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.activateSubscription(subscriptionId, paymentId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error activating subscription: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{subscriptionId}/cancel")
    public ResponseEntity<SubscriptionResponseDTO> cancelSubscription(
            @PathVariable String subscriptionId,
            @RequestParam(value = "immediate", defaultValue = "true") boolean immediate,
            @RequestHeader("Authorization") String token) {

        log.info("Cancelling subscription: {}, immediate: {}", subscriptionId, immediate);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.cancelSubscription(subscriptionId, immediate);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error cancelling subscription: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{subscriptionId}/auto-renew")
    public ResponseEntity<SubscriptionResponseDTO> updateAutoRenew(
            @PathVariable String subscriptionId,
            @RequestParam(value = "enabled") boolean enabled,
            @RequestHeader("Authorization") String token) {

        log.info("Updating auto-renew for subscription: {}, enabled: {}", subscriptionId, enabled);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.updateAutoRenew(subscriptionId, enabled);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error updating auto-renew: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if a company has active premium subscription.
     * Can be used by other services for premium feature gating.
     */
    @GetMapping("/premium-status/{companyId}")
    public ResponseEntity<java.util.Map<String, Object>> checkPremiumStatus(
            @PathVariable String companyId,
            @RequestHeader(value = "Authorization", required = false) String token) {

        log.info("Checking premium status for company: {}", companyId);

        // Allow both authenticated calls and internal service calls
        if (token != null && !token.isEmpty()) {
            try {
                String jwt = token.replace("Bearer ", "");
                jwtUtil.validateToken(jwt);
            } catch (Exception e) {
                log.warn("Invalid JWT token for premium status check");
            }
        }

        boolean isPremium = subscriptionService.isPremiumActive(companyId);

        return ResponseEntity.ok(java.util.Map.of(
                "companyId", companyId,
                "isPremium", isPremium,
                "checkedAt", java.time.LocalDateTime.now().toString()));
    }

    @PutMapping("/{subscriptionId}/plan")
    public ResponseEntity<SubscriptionResponseDTO> changePlan(
            @PathVariable String subscriptionId,
            @RequestParam(value = "newPlan") String newPlan,
            @RequestHeader("Authorization") String token) {

        log.info("Changing plan for subscription: {} to: {}", subscriptionId, newPlan);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.changePlan(subscriptionId, newPlan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error changing plan: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/check-expired")
    public ResponseEntity<List<SubscriptionResponseDTO>> checkExpiredSubscriptions(
            @RequestHeader("Authorization") String token) {

        log.info("Checking for expired subscriptions");

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SubscriptionResponseDTO> response = subscriptionService.checkExpiredSubscriptions();
        return ResponseEntity.ok(response);
    }
}
