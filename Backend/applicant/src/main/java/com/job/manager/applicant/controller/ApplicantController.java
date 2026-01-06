package com.job.manager.applicant.controller;

import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.dto.ApplicantResponse;
import com.job.manager.applicant.dto.ApplicantSearchRequest;
import com.job.manager.applicant.dto.ApplicantSearchResponse;
import com.job.manager.applicant.service.ApplicantService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applicants")
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService service;

    @PostMapping
    public ResponseEntity<String> createApplicant(@RequestBody ApplicantCreateRequest request) {
        String id = service.createApplicant(request);
        return ResponseEntity.ok(id);
    }

    @GetMapping
    public ResponseEntity<List<ApplicantResponse>> getAllApplicants() {
        List<ApplicantResponse> applicants = service.getAllApplicants();
        return ResponseEntity.ok(applicants);
    }

    /**
     * Search applicants with filters (Requirements 5.1.1, 5.1.2, 5.1.3)
     * Returns summary information for search results
     */
    @PostMapping("/search")
    public ResponseEntity<List<ApplicantSearchResponse>> searchApplicants(
            @RequestBody ApplicantSearchRequest request) {
        List<ApplicantSearchResponse> results = service.searchApplicants(request);
        return ResponseEntity.ok(results);
    }

    /**
     * Get applicant detail by ID (Requirement 5.1.4)
     * Shows full information including Education, Work Experience, and Objective Summary
     */
    @GetMapping("/{applicantId}")
    public ResponseEntity<ApplicantResponse> getApplicantById(@PathVariable String applicantId) {
        return service.getApplicantById(applicantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}