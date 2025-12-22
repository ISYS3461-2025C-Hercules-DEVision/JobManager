package com.job.manager.subscription.service;

import com.job.manager.subscription.dto.SubscriptionCreateDTO;
import com.job.manager.subscription.dto.SubscriptionEventDTO;
import com.job.manager.subscription.dto.SubscriptionResponseDTO;
import com.job.manager.subscription.entity.Subscription;
import com.job.manager.subscription.entity.Subscription.PlanType;
import com.job.manager.subscription.entity.Subscription.SubscriptionStatus;
import com.job.manager.subscription.kafka.SubscriptionEventProducer;
import com.job.manager.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionEventProducer eventProducer;

    private static final BigDecimal PREMIUM_PRICE = new BigDecimal("30.00");
    private static final String USD_CURRENCY = "USD";

    public SubscriptionResponseDTO createSubscription(SubscriptionCreateDTO dto) {
        log.info("Creating PREMIUM subscription for company: {}", dto.getCompanyId());

        // Check if subscription already exists
        Optional<Subscription> existingSubscription = subscriptionRepository.findByCompanyId(dto.getCompanyId());
        if (existingSubscription.isPresent()) {
            throw new IllegalArgumentException("Subscription already exists for company: " + dto.getCompanyId());
        }

        // Validate plan type is PREMIUM (only PREMIUM subscriptions should be created)
        if (!"PREMIUM".equalsIgnoreCase(dto.getPlanType())) {
            throw new IllegalArgumentException("Only PREMIUM subscriptions can be created. Freemium access is default.");
        }

        Subscription subscription = new Subscription();
        subscription.setCompanyId(dto.getCompanyId());
        subscription.setPlanType(PlanType.PREMIUM);
        subscription.setPriceAmount(PREMIUM_PRICE);
        subscription.setCurrency(USD_CURRENCY);
        subscription.setStatus(SubscriptionStatus.PENDING); // Requires payment
        subscription.setAutoRenew(false); // Manual renewal as per requirements
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        // Send Kafka event
        SubscriptionEventDTO event = mapToEventDTO(savedSubscription, "CREATED");
        eventProducer.sendSubscriptionCreatedEvent(event);

        return mapToResponseDTO(savedSubscription);
    }

    public SubscriptionResponseDTO getSubscriptionByCompanyId(String companyId) {
        Subscription subscription = subscriptionRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for company: " + companyId));
        return mapToResponseDTO(subscription);
    }

    public SubscriptionResponseDTO getSubscriptionById(String subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));
        return mapToResponseDTO(subscription);
    }

    public List<SubscriptionResponseDTO> getAllSubscriptions() {
        return subscriptionRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public SubscriptionResponseDTO activateSubscription(String subscriptionId, String paymentId) {
        log.info("Activating subscription: {} with payment: {}", subscriptionId, paymentId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalStateException("Subscription is not in PENDING status");
        }

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setExpiryDate(LocalDateTime.now().plusMonths(1)); // 1 month subscription
        subscription.setLastPaymentId(paymentId);
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription activatedSubscription = subscriptionRepository.save(subscription);

        // Send Kafka event
        SubscriptionEventDTO event = mapToEventDTO(activatedSubscription, "ACTIVATED");
        eventProducer.sendSubscriptionActivatedEvent(event);

        return mapToResponseDTO(activatedSubscription);
    }

    public SubscriptionResponseDTO cancelSubscription(String subscriptionId) {
        log.info("Cancelling subscription: {}", subscriptionId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription cancelledSubscription = subscriptionRepository.save(subscription);

        // Send Kafka event
        SubscriptionEventDTO event = mapToEventDTO(cancelledSubscription, "CANCELLED");
        eventProducer.sendSubscriptionCancelledEvent(event);

        return mapToResponseDTO(cancelledSubscription);
    }

    public void expireSubscription(String subscriptionId) {
        log.info("Expiring subscription: {}", subscriptionId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

        subscription.setStatus(SubscriptionStatus.EXPIRED);
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription expiredSubscription = subscriptionRepository.save(subscription);

        // Send Kafka event
        SubscriptionEventDTO event = mapToEventDTO(expiredSubscription, "EXPIRED");
        eventProducer.sendSubscriptionExpiredEvent(event);
    }

    public List<SubscriptionResponseDTO> checkExpiredSubscriptions() {
        List<Subscription> expiredSubscriptions = subscriptionRepository
                .findByExpiryDateBefore(LocalDateTime.now())
                .stream()
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE)
                .collect(Collectors.toList());

        for (Subscription subscription : expiredSubscriptions) {
            expireSubscription(subscription.getSubscriptionId());
        }

        return expiredSubscriptions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private SubscriptionResponseDTO mapToResponseDTO(Subscription subscription) {
        return new SubscriptionResponseDTO(
                subscription.getSubscriptionId(),
                subscription.getCompanyId(),
                subscription.getPlanType().toString(),
                subscription.getPriceAmount(),
                subscription.getCurrency(),
                subscription.getStartDate(),
                subscription.getExpiryDate(),
                subscription.getStatus().toString(),
                subscription.getLastPaymentId(),
                subscription.getAutoRenew(),
                subscription.getCreatedAt(),
                subscription.getUpdatedAt()
        );
    }

    private SubscriptionEventDTO mapToEventDTO(Subscription subscription, String eventType) {
        return new SubscriptionEventDTO(
                subscription.getSubscriptionId(),
                subscription.getCompanyId(),
                subscription.getPlanType().toString(),
                subscription.getStatus().toString(),
                subscription.getStartDate(),
                subscription.getExpiryDate(),
                LocalDateTime.now(),
                eventType
        );
    }
}
