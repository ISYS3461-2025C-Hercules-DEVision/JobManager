package com.job.manager.payment.client;

import com.job.manager.payment.dto.SubscriptionDTO;
import com.job.manager.payment.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Client for communicating with the Subscription Service.
 * Handles subscription validation and retrieval via REST API calls.
 */
@Component
@Slf4j
public class SubscriptionServiceClient {

    private final RestTemplate restTemplate;

    @Value("${subscription.service.url:http://localhost:8083}")
    private String subscriptionServiceUrl;

    public SubscriptionServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get subscription information by ID.
     * 
     * @param subscriptionId The subscription ID to look up
     * @return SubscriptionDTO if found
     * @throws ValidationException if subscription not found or service unavailable
     */
    public SubscriptionDTO getSubscriptionById(String subscriptionId) {
        try {
            String url = subscriptionServiceUrl + "/subscriptions/" + subscriptionId;
            log.info("Fetching subscription from: {}", url);

            ResponseEntity<SubscriptionDTO> response = restTemplate.getForEntity(
                    url,
                    SubscriptionDTO.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully retrieved subscription: {}", subscriptionId);
                return response.getBody();
            } else {
                throw new ValidationException("Subscription not found: " + subscriptionId);
            }

        } catch (HttpClientErrorException.NotFound e) {
            log.error("Subscription not found: {}", subscriptionId);
            throw new ValidationException("Subscription not found: " + subscriptionId);
        } catch (HttpClientErrorException e) {
            log.error("Error fetching subscription {}: {} - {}", subscriptionId, e.getStatusCode(), e.getMessage());
            throw new ValidationException("Unable to validate subscription: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error fetching subscription {}: {}", subscriptionId, e.getMessage());
            throw new ValidationException("Subscription service is currently unavailable. Please try again later.");
        }
    }

    /**
     * Validate that a subscription exists.
     * 
     * @param subscriptionId The subscription ID to validate
     * @return true if subscription exists, false otherwise
     */
    public boolean validateSubscriptionExists(String subscriptionId) {
        try {
            getSubscriptionById(subscriptionId);
            return true;
        } catch (ValidationException e) {
            return false;
        }
    }
}
