package com.job.manager.notification.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CompanyEmailClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.authentication.base-url}")
    private String authBaseUrl; // http://localhost:8000/authentication

    public String getCompanyEmail(String companyId) {
        String url = authBaseUrl + "/users/" + companyId;
        UserDto user = restTemplate.getForObject(url, UserDto.class);
        if (user == null || user.getUsername() == null) {
            throw new IllegalStateException("Cannot resolve email for companyId=" + companyId);
        }
        return user.getUsername();
    }

    @Data
    public static class UserDto {
        private String id;
        private String username;
    }
}