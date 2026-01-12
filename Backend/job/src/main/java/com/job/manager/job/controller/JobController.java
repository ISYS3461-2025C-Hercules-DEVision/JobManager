package com.job.manager.job.controller;

import com.job.manager.job.dto.AuthenticatedUser;
import com.job.manager.job.entity.JobPost;
import com.job.manager.job.dto.JobPostResponse;
import com.job.manager.job.util.JobPostMapper;
import com.job.manager.job.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import com.job.manager.job.annotation.CurrentUser;

import java.util.List;
@RestController
@RequestMapping("")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    public JobPost createJob(
            @CurrentUser AuthenticatedUser user,
            @RequestBody JobPost jobPost
    ) {
        jobPost.setCompanyId(user.getUserId());
        return jobService.createJobPost(jobPost);
    }

    @GetMapping("/jobs/my")
    public List<JobPost> getMyJobs(@CurrentUser AuthenticatedUser user) {
        return jobService.getJobsForCompany(user.getUserId());
    }

        // Endpoint for JA: returns JobPostResponse DTOs with postedDate and expiryDate
        @GetMapping("/jobs/ja")
        public org.springframework.data.domain.Page<JobPostResponse> getAllJobsForJA(
            @RequestParam(required=false) String title,
            @RequestParam(required=false) String location,
            @RequestParam(required=false) String employmentType,
            @RequestParam(required=false) String keyWord,
            @RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="10") int size
        ) {
        org.springframework.data.domain.Page<JobPost> jobs = jobService.getJobs(
            title, location, employmentType, keyWord, page, size
        );
        return jobs.map(JobPostMapper::toResponse);
        }

    // Endpoint for JA: returns JobPostResponse DTO with postedDate and expiryDate
    @GetMapping("/jobs/ja/{jobId}")
    public JobPostResponse getJobByIdForJA(@PathVariable String jobId) {
        JobPost job = jobService.getJobById(jobId);
        return JobPostMapper.toResponse(job);
    }

    @PutMapping("/jobs/{jobId}")
    public JobPost updateJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String jobId,
            @RequestBody JobPost jobPost
    ) {
        return jobService.updateJobPost(jobId, user.getUserId(), jobPost);
    }

    @DeleteMapping("/jobs/{jobId}")
    public void deleteJob(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String jobId
    ) {
        jobService.deleteJobPost(jobId, user.getUserId());
    }

    @PostMapping("/jobs/bulk/activate")
    public void bulkActivate(
            @CurrentUser AuthenticatedUser user,
            @RequestBody List<String> jobIds
    ) {
        jobService.bulkActivate(jobIds, user.getUserId());
    }

    @PostMapping("/jobs/bulk/close")
    public void bulkClose(
            @CurrentUser AuthenticatedUser user,
            @RequestBody List<String> jobIds
    ) {
        jobService.bulkClose(jobIds, user.getUserId());
    }

    @DeleteMapping("/jobs/bulk/delete")
    public void bulkDelete(
            @CurrentUser AuthenticatedUser user,
            @RequestBody List<String> jobIds
    ) {
        jobService.bulkDelete(jobIds, user.getUserId());
    }

    @GetMapping("ping")
    public String ping() {
        return "pong";
    }

    //Todo: Write endpoint to get applications
}
