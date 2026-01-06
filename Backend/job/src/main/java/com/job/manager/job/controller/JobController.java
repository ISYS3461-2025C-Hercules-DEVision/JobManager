package com.job.manager.job.controller;

import com.job.manager.job.dto.AuthenticatedUser;
import com.job.manager.job.dto.JobPostCreateRequest;
import com.job.manager.job.dto.JobPostUpdateRequest;
import com.job.manager.job.dto.JobPostResponse;
import com.job.manager.job.entity.JobPost;
import com.job.manager.job.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.job.manager.job.annotation.CurrentUser;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobPostResponse> createJob(
            @CurrentUser AuthenticatedUser user,
            @RequestBody JobPostCreateRequest request
    ) {
        JobPost created = jobService.createJobPost(request, user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(JobPostResponse.fromEntity(created));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobPostResponse>> getMyJobs(@CurrentUser AuthenticatedUser user) {
        List<JobPostResponse> jobs = jobService.getJobsForCompany(user.getUserId())
                .stream()
                .map(JobPostResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobPostResponse> getJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id
    ) {
        JobPost job = jobService.getJobPost(id, user.getUserId());
        return ResponseEntity.ok(JobPostResponse.fromEntity(job));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobPostResponse> updateJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id,
            @RequestBody JobPostUpdateRequest request
    ) {
        JobPost updated = jobService.updateJobPost(id, request, user.getUserId());
        return ResponseEntity.ok(JobPostResponse.fromEntity(updated));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id
    ) {
        jobService.deleteJobPost(id, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/jobs/{id}/publish")
    public ResponseEntity<JobPostResponse> publishJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id
    ) {
        JobPost published = jobService.publishJobPost(id, user.getUserId());
        return ResponseEntity.ok(JobPostResponse.fromEntity(published));
    }

    @GetMapping("/public/jobs")
    public ResponseEntity<List<JobPostResponse>> getPublicJobs() {
        List<JobPostResponse> jobs = jobService.getPublicJobs()
                .stream()
                .map(JobPostResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("ping")
    public String ping() {
        return "pong";
    }

    //Todo: Write endpoint to get applications
}

