package com.job.manager.notification.controller;

import com.job.manager.notification.dto.ApplicantMatchResponse;
import com.job.manager.notification.dto.ApplicantProfileRequest;
import com.job.manager.notification.model.ApplicantProfile;
import com.job.manager.notification.model.CompanySearchProfile;
import com.job.manager.notification.repository.ApplicantProfileRepository;
import com.job.manager.notification.repository.CompanySearchProfileRepository;
import com.job.manager.notification.service.MatchingService;
import com.job.manager.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/mock")
@RequiredArgsConstructor
public class MockApplicantController {

    private final ApplicantProfileRepository applicantRepository;
    private final CompanySearchProfileRepository profileRepository;
    private final MatchingService matchingService;
    private final NotificationService notificationService;

    @PostMapping("/applicants")
    public ResponseEntity<ApplicantMatchResponse> createMockApplicant(
            @RequestBody ApplicantProfileRequest request
    ) {
        // 1. Save applicant
        ApplicantProfile applicant = ApplicantProfile.builder()
                .applicantId(request.getApplicantId())
                .name(request.getName())
                .technicalTags(request.getTechnicalTags())
                .employmentStatus(request.getEmploymentStatus())
                .country(request.getCountry())
                .expectedSalaryMin(request.getExpectedSalaryMin())
                .expectedSalaryMax(request.getExpectedSalaryMax())
                .highestEducationDegree(request.getHighestEducationDegree())
                .build();

        applicantRepository.save(applicant);

        // 2. Match against all company profiles
        List<String> matchedCompanyIds = new ArrayList<>();

        List<CompanySearchProfile> profiles = profileRepository.findAll();
        for (CompanySearchProfile profile : profiles) {
            if (matchingService.matches(applicant, profile)) {
                matchedCompanyIds.add(profile.getCompanyId());
                notificationService.createApplicantMatchNotification(
                        profile.getCompanyId(),
                        applicant.getApplicantId(),
                        applicant.getName()
                );
            }
        }

        // 3. Return which companies were notified
        return ResponseEntity.ok(new ApplicantMatchResponse(matchedCompanyIds));
    }
}