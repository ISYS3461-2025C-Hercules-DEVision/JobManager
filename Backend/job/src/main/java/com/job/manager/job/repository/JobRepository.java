package com.job.manager.job.repository;


import com.job.manager.job.entity.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRepository extends MongoRepository<JobPost, UUID> {
	List<JobPost> findByCompanyIdOrderByPostedDateDesc(String companyId);
	List<JobPost> findAllByPublishedTrue();
	Optional<JobPost> findByIdAndCompanyId(UUID id, String companyId);
}

