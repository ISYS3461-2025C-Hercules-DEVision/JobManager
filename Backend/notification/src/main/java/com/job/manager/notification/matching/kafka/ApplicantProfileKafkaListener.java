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

        long startTime = System.currentTimeMillis();

        try {
            List<CompanySearchProfileDto> profiles = subscriptionClient.getAllSearchProfiles();
            log.info("Retrieved {} company search profiles for matching", profiles.size());

            if (profiles.isEmpty()) {
                log.warn("No company search profiles available for matching applicant {}", event.getApplicantId());
                return;
            }

            List<String> matchedCompanyIds = matchingEngine.findMatchingCompanyIds(event, profiles);
            log.info("Matching complete: applicant {} matched with {} out of {} companies",
                    event.getApplicantId(), matchedCompanyIds.size(), profiles.size());

            if (matchedCompanyIds.isEmpty()) {
                log.info("No matches found for applicant {} (country: {}, skills: {})",
                        event.getApplicantId(), event.getCountry(), event.getSkills());
            }

            for (String companyId : matchedCompanyIds) {
                ApplicantMatchedEvent matchedEvent = new ApplicantMatchedEvent();
                matchedEvent.setCompanyId(companyId);
                matchedEvent.setApplicantId(event.getApplicantId());
                matchedEvent.setApplicantName(event.getFullName());

                log.debug("Sending match notification to company {} for applicant {}",
                        companyId, event.getApplicantId());
                notificationService.handleApplicantMatched(matchedEvent);
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Successfully processed applicant {} - matched with {} companies in {}ms",
                    event.getApplicantId(), matchedCompanyIds.size(), duration);

        } catch (Exception e) {
            log.error("Error processing applicant event for {}: {}",
                    event.getApplicantId(), e.getMessage(), e);
            throw e;
        }
    }
}

