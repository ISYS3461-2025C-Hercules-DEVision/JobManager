package com.job.manager.company.client;

import com.job.manager.company.dto.ApplicantDTO;
import com.job.manager.company.dto.ApplicantSearchRequestDTO;
import com.job.manager.company.dto.ApplicantSearchResultDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicantClient {

    private final RestTemplate restTemplate;

    @Value("${applicant.service.url:http://localhost:8084}")
    private String applicantServiceUrl;

    public List<ApplicantDTO> getAllApplicants() {
        try {
            String url = applicantServiceUrl + "/applicants";
            log.info("Fetching applicants from: {}", url);
            
            ResponseEntity<List<ApplicantDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ApplicantDTO>>() {}
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching applicants from applicant service", e);
            throw new RuntimeException("Failed to fetch applicants: " + e.getMessage());
        }
    }

    /**
     * Search applicants with filters
     */
    public List<ApplicantSearchResultDTO> searchApplicants(ApplicantSearchRequestDTO searchRequest) {
        try {
            String url = applicantServiceUrl + "/applicants/search";
            log.info("Searching applicants at: {} with filters: {}", url, searchRequest);
            
            HttpEntity<ApplicantSearchRequestDTO> request = new HttpEntity<>(searchRequest);
            
            ResponseEntity<List<ApplicantSearchResultDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<List<ApplicantSearchResultDTO>>() {}
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("Error searching applicants from applicant service", e);
            throw new RuntimeException("Failed to search applicants: " + e.getMessage());
        }
    }

    /**
     * Get applicant detail by ID
     */
    public ApplicantDTO getApplicantById(String applicantId) {
        try {
            String url = applicantServiceUrl + "/applicants/" + applicantId;
            log.info("Fetching applicant detail from: {}", url);
            
            ResponseEntity<ApplicantDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    ApplicantDTO.class
            );
            
            return response.getBody();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            log.warn("Applicant not found with ID: {}", applicantId);
            return null;  // Return null for 404, let controller handle it
        } catch (Exception e) {
            log.error("Error fetching applicant detail from applicant service for ID: {}", applicantId, e);
            throw new RuntimeException("Failed to fetch applicant detail: " + e.getMessage());
        }
    }
}
