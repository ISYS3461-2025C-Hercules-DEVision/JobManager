package com.job.manager.notification.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CompanyEmailClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.company.base-url:http://localhost:8081}")
    private String companyBaseUrl;

    public String getCompanyEmail(String companyId) {
        String url = companyBaseUrl + "/companies/" + companyId;
        CompanyDto company = restTemplate.getForObject(url, CompanyDto.class);
        if (company == null || company.getEmail() == null) {
            throw new IllegalStateException("Cannot resolve email for companyId=" + companyId);
        }
        return company.getEmail();
    }

    @Data
    public static class CompanyDto {
        private String companyId;
        private String companyName;
        private String email;
        private Boolean isPremium;
        private Boolean isActive;
        private Boolean isEmailVerified;
    }
}