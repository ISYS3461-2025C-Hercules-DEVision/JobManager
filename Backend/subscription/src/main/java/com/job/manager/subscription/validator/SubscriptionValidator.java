package com.job.manager.subscription.validator;

import com.job.manager.subscription.client.CompanyServiceClient;
import com.job.manager.subscription.dto.SubscriptionCreateDTO;
import com.job.manager.subscription.entity.Subscription;
import com.job.manager.subscription.exception.ValidationException;
import com.job.manager.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

/**
 * Centralized validation service for subscription business rules.
 * Ensures data integrity and prevents invalid subscription creation.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionValidator {

    private final CompanyServiceClient companyServiceClient;
    private final SubscriptionRepository subscriptionRepository;

    /**
     * Validate all business rules for subscription creation.
     * 
     * @param dto The subscription creation request
     * @throws ValidationException if any validation rule fails
     */
    public void validateSubscriptionCreation(SubscriptionCreateDTO dto) {
        log.info("Validating subscription creation for company: {}", dto.getCompanyId());

        // 1. Validate input fields
        validateInputFields(dto);

        // 2. Validate plan type
        validatePlanType(dto.getPlanType());

        // 3. Validate company exists
        validateCompanyExists(dto.getCompanyId());

        // 4. Check for duplicate subscriptions
        validateNoDuplicateSubscription(dto.getCompanyId());

        log.info("All validation checks passed for company: {}", dto.getCompanyId());
    }

    /**
     * Validate that required input fields are not null or empty.
     */
    private void validateInputFields(SubscriptionCreateDTO dto) {
        if (dto.getCompanyId() == null || dto.getCompanyId().trim().isEmpty()) {
            throw new ValidationException("Company ID is required and cannot be empty");
        }

        if (dto.getPlanType() == null || dto.getPlanType().trim().isEmpty()) {
            throw new ValidationException("Plan type is required and cannot be empty");
        }
    }

    /**
     * Validate that the plan type is valid (FREE or PREMIUM).
     */
    private void validatePlanType(String planType) {
        try {
            Subscription.PlanType.valueOf(planType.toUpperCase());
        } catch (IllegalArgumentException e) {
            String validTypes = Arrays.toString(Subscription.PlanType.values());
            throw new ValidationException(
                    String.format("Invalid plan type '%s'. Valid types are: %s", planType, validTypes));
        }
    }

    /**
     * Validate that the company exists in the company service.
     */
    private void validateCompanyExists(String companyId) {
        log.info("Validating company exists: {}", companyId);

        // This will throw ValidationException if company not found
        companyServiceClient.getCompanyById(companyId);

        log.info("Company validation successful: {}", companyId);
    }

    /**
     * Validate that the company doesn't already have an active or pending
     * subscription.
     */
    private void validateNoDuplicateSubscription(String companyId) {
        log.info("Checking for duplicate subscriptions for company: {}", companyId);

        Optional<Subscription> existingSubscription = subscriptionRepository.findByCompanyId(companyId);

        if (existingSubscription.isPresent()) {
            Subscription subscription = existingSubscription.get();
            Subscription.SubscriptionStatus status = subscription.getStatus();

            // Only allow new subscription if previous one is EXPIRED or CANCELLED
            if (status == Subscription.SubscriptionStatus.ACTIVE) {
                throw new ValidationException(
                        String.format("Company %s already has an %s subscription. " +
                                "Please cancel the existing subscription before creating a new one.",
                                companyId, status.name().toLowerCase()));
            }

            log.info("Found existing {} subscription for company {}, allowing new subscription",
                    status, companyId);
        }
    }
}
