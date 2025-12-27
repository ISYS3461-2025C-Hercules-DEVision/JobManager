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
            @RequestHeader("Authorization") String token) {

        log.info("Cancelling subscription: {}", subscriptionId);

        // Validate JWT token
        try {
            String jwt = token.replace("Bearer ", "");
            jwtUtil.validateToken(jwt);
        } catch (Exception e) {
            log.error("Invalid JWT token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SubscriptionResponseDTO response = subscriptionService.cancelSubscription(subscriptionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error cancelling subscription: {}", e.getMessage());
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
