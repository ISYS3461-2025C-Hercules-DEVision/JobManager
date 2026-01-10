package com.job.manager.notification.matching.service;

import com.job.manager.notification.matching.dto.CompanySearchProfileDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class SubscriptionClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.subscription.base-url:http://localhost:8083}")
    private String subscriptionBaseUrl;

    public List<CompanySearchProfileDto> getAllSearchProfiles() {
        String url = subscriptionBaseUrl + "/subscriptions/search-profiles";
        CompanySearchProfileDto[] profiles =
                restTemplate.getForObject(url, CompanySearchProfileDto[].class);

        return profiles != null ? Arrays.asList(profiles) : List.of();
    }
}
