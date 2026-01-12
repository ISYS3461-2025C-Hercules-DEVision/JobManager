package com.job.manager.notification.matching.kafka;

import com.job.manager.notification.dto.ApplicantMatchedEvent;
import com.job.manager.notification.matching.dto.ApplicantCreatedEvent;
import com.job.manager.notification.matching.dto.CompanySearchProfileDto;
import com.job.manager.notification.matching.service.MatchingEngine;
import com.job.manager.notification.matching.service.SubscriptionClient;
import com.job.manager.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicantProfileKafkaListener {

    private final SubscriptionClient subscriptionClient;
    private final MatchingEngine matchingEngine;
    private final NotificationService notificationService;

    @KafkaListener(
            topics = "applicant-profile-updates",
            groupId = "notification-matching-group",
            containerFactory = "applicantProfileKafkaListenerContainerFactory"
    )
    public void onApplicantCreated(ApplicantCreatedEvent event) {
        log.info("Notification(Matching): received applicant event: {} ({})",
                event.getFullName(), event.getApplicantId());

        List<CompanySearchProfileDto> profiles = subscriptionClient.getAllSearchProfiles();
        List<String> matchedCompanyIds = matchingEngine.findMatchingCompanyIds(event, profiles);

        for (String companyId : matchedCompanyIds) {
            ApplicantMatchedEvent matchedEvent = new ApplicantMatchedEvent();
            matchedEvent.setCompanyId(companyId);
            matchedEvent.setApplicantId(event.getApplicantId());
            matchedEvent.setApplicantName(event.getFullName());

            notificationService.handleApplicantMatched(matchedEvent);
        }
        
        log.info("Matched applicant {} with {} companies", event.getApplicantId(), matchedCompanyIds.size());
    }
}

