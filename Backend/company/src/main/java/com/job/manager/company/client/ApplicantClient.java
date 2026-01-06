package com.job.manager.company.client;

import com.job.manager.company.dto.ApplicantDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
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
}
