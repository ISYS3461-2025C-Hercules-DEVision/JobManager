package com.job.manager.matching.service;

import com.job.manager.matching.dto.CompanySearchProfileDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class SubscriptionClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<CompanySearchProfileDto> getAllSearchProfiles() {
        String url = "http://localhost:8083/subscriptions/search-profiles";
        CompanySearchProfileDto[] profiles =
                restTemplate.getForObject(url, CompanySearchProfileDto[].class);

        return profiles != null ? Arrays.asList(profiles) : List.of();
    }
}