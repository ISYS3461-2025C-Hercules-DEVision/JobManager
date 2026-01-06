package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.SubscriptionCreateDTO;
import com.job.manager.subscription.dto.SubscriptionEventDTO;
import com.job.manager.subscription.dto.SubscriptionResponseDTO;
import com.job.manager.subscription.entity.Subscription;
import com.job.manager.subscription.kafka.SubscriptionEventProducer;
import com.job.manager.subscription.repository.CompanySearchProfileRepository;
import com.job.manager.subscription.repository.SubscriptionRepository;
import com.job.manager.subscription.validator.SubscriptionValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionEventProducer eventProducer;
    private final SubscriptionValidator subscriptionValidator;
    private final CompanySearchProfileRepository companySearchProfileRepository;

    public boolean isPremiumActive(String companyId) {
        return subscriptionRepository.findByCompanyId(companyId)
                .map(sub -> sub.getStatus() == Subscription.SubscriptionStatus.ACTIVE &&
                        sub.getExpiryDate() != null &&
                        sub.getExpiryDate().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public SubscriptionResponseDTO createSubscription(SubscriptionCreateDTO dto) {
        log.info("Creating subscription for company: {}", dto.getCompanyId());

        // VALIDATION: Apply all business rules before creating subscription
        subscriptionValidator.validateSubscriptionCreation(dto);

        Subscription subscription = new Subscription();
        subscription.setCompanyId(dto.getCompanyId());
        subscription.setPlanType(Subscription.PlanType.valueOf(dto.getPlanType().toUpperCase()));
        subscription.setStatus(Subscription.SubscriptionStatus.PENDING);
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        subscription.setAutoRenew(false);
        subscription.setCurrency("USD");

        if (subscription.getPlanType() == Subscription.PlanType.PREMIUM) {
            subscription.setPriceAmount(new BigDecimal("30.00"));
        } else {
            subscription.setPriceAmount(BigDecimal.ZERO);
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscription.setStartDate(LocalDateTime.now());
            // Free plans might be indefinite or have a set expiry
            subscription.setExpiryDate(LocalDateTime.now().plusYears(100));
        }

        Subscription saved = subscriptionRepository.save(subscription);

        // Publish Kafka event
        SubscriptionEventDTO event = mapToEventDTO(saved);
        eventProducer.sendSubscriptionCreatedEvent(event);

        return mapToResponseDTO(saved);
    }

    public SubscriptionResponseDTO getSubscriptionByCompanyId(String companyId) {
        log.info("Getting subscription for company: {}", companyId);
        Subscription subscription = subscriptionRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for company: " + companyId));
        return mapToResponseDTO(subscription);
    }

    public SubscriptionResponseDTO getSubscriptionById(String subscriptionId) {
        log.info("Getting subscription by ID: {}", subscriptionId);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));
        return mapToResponseDTO(subscription);
    }

    public List<SubscriptionResponseDTO> getAllSubscriptions() {
        log.info("Getting all subscriptions");
        return subscriptionRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public SubscriptionResponseDTO activateSubscription(String subscriptionId, String paymentId) {
        log.info("Activating subscription: {} with payment: {}", subscriptionId, paymentId);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentExpiry = subscription.getExpiryDate();
        LocalDateTime newExpiry;

        // If currently active and not expired, extend. Otherwise start from now.
        if (currentExpiry != null && currentExpiry.isAfter(now)) {
            newExpiry = currentExpiry.plusMonths(1);
        } else {
            subscription.setStartDate(now); // Reset start date if expired or new
            newExpiry = now.plusMonths(1);
        }

        subscription.setExpiryDate(newExpiry);
        subscription.setLastPaymentId(paymentId);
        subscription.setUpdatedAt(now);

        Subscription saved = subscriptionRepository.save(subscription);

        // Publish Kafka event to notify company service
        SubscriptionEventDTO event = mapToEventDTO(saved);
        eventProducer.sendSubscriptionActivatedEvent(event);
        log.info(">>> [SUBSCRIPTION] Published activation event for company: {}", saved.getCompanyId());

        return mapToResponseDTO(saved);
    }

    public SubscriptionResponseDTO cancelSubscription(String subscriptionId, boolean immediate) {
        log.info("Cancelling subscription: {}, immediate: {}", subscriptionId, immediate);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        // Disable auto-renewal for all cancellations
        subscription.setAutoRenew(false);
        subscription.setUpdatedAt(LocalDateTime.now());

        if (immediate) {
            // Immediate cancellation: End subscription now
            subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            subscription.setExpiryDate(LocalDateTime.now());
            log.info("Subscription {} cancelled immediately", subscriptionId);
        } else {
            // End-of-period cancellation: Keep active until expiry, but won't renew
            // Status remains ACTIVE, will naturally expire at expiryDate
            log.info("Subscription {} marked for cancellation at end of period ({})",
                    subscriptionId, subscription.getExpiryDate());
        }

        Subscription saved = subscriptionRepository.save(subscription);

        // Publish Kafka event to notify company service
        SubscriptionEventDTO event = mapToEventDTO(saved);
        if (immediate) {
            eventProducer.sendSubscriptionCancelledEvent(event);
        }
        log.info(">>> [SUBSCRIPTION] Published cancellation event for company: {}", saved.getCompanyId());

        return mapToResponseDTO(saved);
    }

    /**
     * Cancel subscription with immediate effect (backward compatible overload)
     */
    public SubscriptionResponseDTO cancelSubscription(String subscriptionId) {
        return cancelSubscription(subscriptionId, true);
    }

    /**
     * Update auto-renewal setting for a subscription
     */
    public SubscriptionResponseDTO updateAutoRenew(String subscriptionId, boolean enabled) {
        log.info("Updating auto-renew for subscription: {}, enabled: {}", subscriptionId, enabled);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        // Only allow auto-renew for ACTIVE subscriptions
        if (enabled && subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Cannot enable auto-renew for non-active subscription");
        }

        subscription.setAutoRenew(enabled);
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Auto-renew updated for subscription: {}, new value: {}", subscriptionId, enabled);

        return mapToResponseDTO(saved);
    }

    public List<SubscriptionResponseDTO> checkExpiredSubscriptions() {
        return checkExpiredSubscriptions(false);
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?") // Every day at midnight
    public void scheduleSubscriptionChecks() {
        log.info("Running scheduled subscription checks...");
        checkExpiredSubscriptions(true);
        checkExpiringSoonSubscriptions();
    }

    private List<SubscriptionResponseDTO> checkExpiredSubscriptions(boolean autoRun) {
        log.info("Checking for expired subscriptions (auto: {})", autoRun);
        LocalDateTime now = LocalDateTime.now();
        List<Subscription> expiredSubscriptions = subscriptionRepository.findAll().stream()
                .filter(s -> s.getExpiryDate() != null && s.getExpiryDate().isBefore(now))
                .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                .collect(Collectors.toList());

        expiredSubscriptions.forEach(subscription -> {
            subscription.setStatus(Subscription.SubscriptionStatus.EXPIRED);
            subscription.setUpdatedAt(LocalDateTime.now());
            Subscription saved = subscriptionRepository.save(subscription);

            // Deactivate search profile for expired subscription
            try {
                companySearchProfileRepository.deleteByCompanyId(subscription.getCompanyId());
                log.info(">>> [SUBSCRIPTION] Deactivated search profile for expired company: {}",
                        subscription.getCompanyId());
            } catch (Exception e) {
                log.warn("Could not delete search profile for company: {} - {}",
                        subscription.getCompanyId(), e.getMessage());
            }

            // Send EXPIRED event
            eventProducer.sendSubscriptionExpiredEvent(mapToEventDTO(saved));
        });

        return expiredSubscriptions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private void checkExpiringSoonSubscriptions() {
        log.info("Checking for subscriptions expiring in 7 days...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningWindowStart = now.plusDays(7).minusHours(1); // 7 days from now (tolerant)
        LocalDateTime warningWindowEnd = now.plusDays(7).plusHours(25); // Window to catch today's +7 matches

        // Find active subscriptions expiring roughly 7 days from now
        List<Subscription> expiringSoon = subscriptionRepository.findAll().stream()
                .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                .filter(s -> s.getExpiryDate() != null)
                .filter(s -> s.getExpiryDate().isAfter(warningWindowStart)
                        && s.getExpiryDate().isBefore(warningWindowEnd))
                .collect(Collectors.toList());

        log.info("Found {} subscriptions expiring soon", expiringSoon.size());

        expiringSoon.forEach(sub -> {
            log.info("Notifying expiring soon for company: {}", sub.getCompanyId());
            eventProducer.sendSubscriptionExpiringSoonEvent(mapToEventDTO(sub));
        });
    }

    private SubscriptionResponseDTO mapToResponseDTO(Subscription subscription) {
        SubscriptionResponseDTO dto = new SubscriptionResponseDTO();
        dto.setSubscriptionId(subscription.getSubscriptionId());
        dto.setCompanyId(subscription.getCompanyId());
        dto.setPlanType(subscription.getPlanType().name());
        dto.setPriceAmount(subscription.getPriceAmount());
        dto.setCurrency(subscription.getCurrency());
        dto.setStartDate(subscription.getStartDate());
        dto.setExpiryDate(subscription.getExpiryDate());
        dto.setStatus(subscription.getStatus().name());
        dto.setLastPaymentId(subscription.getLastPaymentId());
        dto.setAutoRenew(subscription.getAutoRenew());
        dto.setCreatedAt(subscription.getCreatedAt());
        dto.setUpdatedAt(subscription.getUpdatedAt());
        return dto;
    }

    private SubscriptionEventDTO mapToEventDTO(Subscription subscription) {
        SubscriptionEventDTO event = new SubscriptionEventDTO();
        event.setSubscriptionId(subscription.getSubscriptionId());
        event.setCompanyId(subscription.getCompanyId());
        event.setPlanType(subscription.getPlanType().name());
        event.setStatus(subscription.getStatus().name());
        event.setStartDate(subscription.getStartDate());
        event.setExpiryDate(subscription.getExpiryDate());
        event.setTimestamp(LocalDateTime.now());
        return event;
    }
}