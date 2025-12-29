package com.job.manager.matching.kafka;

import com.job.manager.matching.dto.ApplicantCreatedEvent;
import com.job.manager.matching.dto.ApplicantMatchedEvent;
import com.job.manager.matching.dto.CompanySearchProfileDto;
import com.job.manager.matching.service.MatchingEngine;
import com.job.manager.matching.service.SubscriptionClient;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MatchingKafkaListener {

    private final SubscriptionClient subscriptionClient;
    private final MatchingEngine matchingEngine;
    private final KafkaTemplate<String, ApplicantMatchedEvent> kafkaTemplate;

    private static final String MATCHED_TOPIC = "applicant.matches";

    @KafkaListener(
            topics = "applicant.profile",
            groupId = "matching-group",
            containerFactory = "applicantKafkaListenerContainerFactory"
    )
    public void onApplicantCreated(ApplicantCreatedEvent event) {
        System.out.println("MatchingService: received applicant event: " + event);

        // 1. Get all company search profiles
        List<CompanySearchProfileDto> profiles = subscriptionClient.getAllSearchProfiles();

        // 2. Find matches
        List<String> matchedCompanyIds =
                matchingEngine.findMatchingCompanyIds(event, profiles);

        System.out.println("MatchingService: matched companies: " + matchedCompanyIds);

        // 3. Emit match events
        for (String companyId : matchedCompanyIds) {
            ApplicantMatchedEvent matchedEvent = ApplicantMatchedEvent.builder()
                    .companyId(companyId)
                    .applicantId(event.getApplicantId())
                    .applicantName(event.getName())
                    .build();

            kafkaTemplate.send(MATCHED_TOPIC, matchedEvent);
        }
    }
}