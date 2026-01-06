package com.job.manager.applicant.controller;

import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.dto.ApplicantResponse;
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
}