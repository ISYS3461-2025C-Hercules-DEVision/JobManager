package com.job.manager.applicant.controller;

import com.job.manager.applicant.dto.ApplicantCreateRequest;
import com.job.manager.applicant.service.ApplicantService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}