package com.job.manager.job.controller;

import com.job.manager.job.entity.JobPost;
import com.job.manager.job.service.JobService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    public JobPost createJobPost(@RequestBody JobPost jobPost) {
        return jobService.createJobPost(jobPost);
    }

    @GetMapping("ping")
    public String ping() {
        return "pong";
    }

    //Todo: Write endpoint to get applications
}
