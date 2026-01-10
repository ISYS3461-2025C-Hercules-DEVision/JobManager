package com.job.manager.job.controller;

import com.job.manager.job.dto.AuthenticatedUser;
import com.job.manager.job.entity.JobPost;
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

    @GetMapping("/jobs")
    public Page<JobPost> getAllJobs(@RequestParam String title, @RequestParam String location,
                                    @RequestParam String employmentType, @RequestParam String keyWord,
                                    @RequestParam int page, @RequestParam int size) {
        return jobService.getJobs(title, location, employmentType, keyWord, page, size);
    }

    @GetMapping("/jobs/{jobId}")
    public JobPost getJobById(@PathVariable String jobId
    ) {
        return jobService.getJobById(jobId);
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
