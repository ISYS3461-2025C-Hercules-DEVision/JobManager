package com.job.manager.subscription.client;

import com.job.manager.subscription.dto.CompanyDTO;
import com.job.manager.subscription.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Client for communicating with the Company Service.
 * Handles company validation and retrieval via REST API calls.
 */
@Component
@Slf4j
public class CompanyServiceClient {

    private final RestTemplate restTemplate;

    @Value("${company.service.url:http://localhost:8081}")
    private String companyServiceUrl;

    public CompanyServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get company information by ID.
     * 
     * @param companyId The company ID to look up
     * @return CompanyDTO if found
     * @throws ValidationException if company not found or service unavailable
     */
    public CompanyDTO getCompanyById(String companyId) {
        try {
            String url = companyServiceUrl + "/companies/" + companyId;
            log.info("Fetching company from: {}", url);

            ResponseEntity<CompanyDTO> response = restTemplate.getForEntity(
                    url,
                    CompanyDTO.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully retrieved company: {}", companyId);
                return response.getBody();
            } else {
                throw new ValidationException("Company not found: " + companyId);
            }

        } catch (HttpClientErrorException.NotFound e) {
            log.error("Company not found: {}", companyId);
            throw new ValidationException("Company not found: " + companyId);
        } catch (HttpClientErrorException e) {
            log.error("Error fetching company {}: {} - {}", companyId, e.getStatusCode(), e.getMessage());
            throw new ValidationException("Unable to validate company: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error fetching company {}: {}", companyId, e.getMessage());
            throw new ValidationException("Company service is currently unavailable. Please try again later.");
        }
    }

    /**
     * Validate that a company exists.
     * 
     * @param companyId The company ID to validate
     * @return true if company exists, false otherwise
     */
    public boolean validateCompanyExists(String companyId) {
        try {
            getCompanyById(companyId);
            return true;
        } catch (ValidationException e) {
            return false;
        }
    }
}
