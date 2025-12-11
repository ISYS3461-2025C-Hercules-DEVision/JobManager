package com.job.manager.job.repository;


import com.job.manager.job.entity.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface JobRepository extends MongoRepository<JobPost, UUID> {}

