package com.job.manager.payment.validator;

import com.job.manager.payment.client.CompanyServiceClient;
import com.job.manager.payment.client.SubscriptionServiceClient;
import com.job.manager.payment.dto.PaymentInitiateRequestDTO;
import com.job.manager.payment.dto.SubscriptionDTO;
import com.job.manager.payment.entity.PaymentTransaction;
import com.job.manager.payment.exception.ValidationException;
import com.job.manager.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * Centralized validation service for payment business rules.
 * Ensures data integrity and prevents invalid payment creation.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentValidator {

    private final SubscriptionServiceClient subscriptionServiceClient;
    private final CompanyServiceClient companyServiceClient;
    private final PaymentTransactionRepository paymentRepository;

    /**
     * Validate all business rules for payment initiation.
     * 
     * @param request The payment initiation request
     * @throws ValidationException if any validation rule fails
     */
    public void validatePaymentInitiation(PaymentInitiateRequestDTO request) {
        log.info("Validating payment initiation for subsystem: {}, type: {}, customer: {}",
                request.getSubsystem(), request.getPaymentType(), request.getCustomerId());

        // 1. Validate input fields
        validateInputFields(request);

        // 2. Validate enum values
        validateEnumValues(request);

        // 3. Validate based on subsystem and payment type
        if ("JOB_MANAGER".equalsIgnoreCase(request.getSubsystem())) {
            validateJobManagerPayment(request);
        } else if ("JOB_APPLICANT".equalsIgnoreCase(request.getSubsystem())) {
            validateJobApplicantPayment(request);
        }

        // 4. Check for duplicate pending payments
        validateNoDuplicatePendingPayment(request);

        log.info("All validation checks passed for payment request");
    }

    /**
     * Validate that required input fields are not null or empty.
     */
    private void validateInputFields(PaymentInitiateRequestDTO request) {
        if (request.getSubsystem() == null || request.getSubsystem().trim().isEmpty()) {
            throw new ValidationException("Subsystem is required and cannot be empty");
        }

        if (request.getPaymentType() == null || request.getPaymentType().trim().isEmpty()) {
            throw new ValidationException("Payment type is required and cannot be empty");
        }

        if (request.getCustomerId() == null || request.getCustomerId().trim().isEmpty()) {
            throw new ValidationException("Customer ID is required and cannot be empty");
        }

        if (request.getReferenceId() == null || request.getReferenceId().trim().isEmpty()) {
            throw new ValidationException("Reference ID is required and cannot be empty");
        }

        if (request.getGateway() == null || request.getGateway().trim().isEmpty()) {
            throw new ValidationException("Gateway is required and cannot be empty");
        }
    }

    /**
     * Validate that enum values are valid.
     */
    private void validateEnumValues(PaymentInitiateRequestDTO request) {
        // Validate subsystem
        try {
            PaymentTransaction.Subsystem.valueOf(request.getSubsystem().toUpperCase());
        } catch (IllegalArgumentException e) {
            String validSubsystems = Arrays.toString(PaymentTransaction.Subsystem.values());
            throw new ValidationException(
                    String.format("Invalid subsystem '%s'. Valid values are: %s",
                            request.getSubsystem(), validSubsystems));
        }

        // Validate payment type
        try {
            PaymentTransaction.PaymentType.valueOf(request.getPaymentType().toUpperCase());
        } catch (IllegalArgumentException e) {
            String validTypes = Arrays.toString(PaymentTransaction.PaymentType.values());
            throw new ValidationException(
                    String.format("Invalid payment type '%s'. Valid values are: %s",
                            request.getPaymentType(), validTypes));
        }

        // Validate gateway
        try {
            PaymentTransaction.PaymentGateway.valueOf(request.getGateway().toUpperCase());
        } catch (IllegalArgumentException e) {
            String validGateways = Arrays.toString(PaymentTransaction.PaymentGateway.values());
            throw new ValidationException(
                    String.format("Invalid gateway '%s'. Valid values are: %s",
                            request.getGateway(), validGateways));
        }
    }

    /**
     * Validate Job Manager specific payment rules.
     */
    private void validateJobManagerPayment(PaymentInitiateRequestDTO request) {
        log.info("Validating Job Manager payment for type: {}", request.getPaymentType());

        // Validate customer (company) exists
        validateCompanyExists(request.getCustomerId());

        // For SUBSCRIPTION payments, validate subscription details
        if ("SUBSCRIPTION".equalsIgnoreCase(request.getPaymentType())) {
            validateSubscriptionPayment(request);
        }
    }

    /**
     * Validate Job Applicant specific payment rules.
     */
    private void validateJobApplicantPayment(PaymentInitiateRequestDTO request) {
        log.info("Validating Job Applicant payment for type: {}", request.getPaymentType());

        // Note: Applicant service not yet implemented, so skip applicant validation for
        // now
        // When implemented, this should validate applicant exists similar to company
        // validation
        log.info("Applicant validation skipped - applicant service not yet implemented");
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
     * Validate subscription payment specific rules.
     */
    private void validateSubscriptionPayment(PaymentInitiateRequestDTO request) {
        String subscriptionId = request.getReferenceId();
        log.info("Validating subscription payment for subscription: {}", subscriptionId);

        // 1. Verify subscription exists
        SubscriptionDTO subscription = subscriptionServiceClient.getSubscriptionById(subscriptionId);

        // 2. Verify subscription is in PENDING status (hasn't been paid yet)
        if (!"PENDING".equalsIgnoreCase(subscription.getStatus())) {
            throw new ValidationException(
                    String.format(
                            "Subscription %s is not pending (current status: %s). Cannot initiate payment for non-pending subscription.",
                            subscriptionId, subscription.getStatus()));
        }

        // 3. Verify payment amount matches subscription price
        if (request.getAmount().compareTo(subscription.getPriceAmount()) != 0) {
            throw new ValidationException(
                    String.format("Payment amount %s %s does not match subscription price %s %s",
                            request.getAmount(), request.getCurrency(),
                            subscription.getPriceAmount(), subscription.getCurrency()));
        }

        // 4. Verify customer ID matches subscription company ID
        if (!request.getCustomerId().equals(subscription.getCompanyId())) {
            throw new ValidationException(
                    String.format("Customer ID %s does not match subscription company ID %s",
                            request.getCustomerId(), subscription.getCompanyId()));
        }

        log.info("Subscription payment validation successful for: {}", subscriptionId);
    }

    /**
     * Validate that no duplicate pending payment exists for the same reference.
     */
    private void validateNoDuplicatePendingPayment(PaymentInitiateRequestDTO request) {
        log.info("Checking for duplicate pending payments for reference: {}", request.getReferenceId());

        // Find any existing PENDING payments for this reference
        List<PaymentTransaction> existingPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getReferenceId().equals(request.getReferenceId()))
                .filter(p -> p.getStatus() == PaymentTransaction.PaymentStatus.PENDING)
                .toList();

        if (!existingPayments.isEmpty()) {
            throw new ValidationException(
                    String.format("A pending payment already exists for reference: %s. " +
                            "Please wait for the existing payment to complete or cancel it first.",
                            request.getReferenceId()));
        }

        log.info("No duplicate pending payment found for reference: {}", request.getReferenceId());
    }
}
