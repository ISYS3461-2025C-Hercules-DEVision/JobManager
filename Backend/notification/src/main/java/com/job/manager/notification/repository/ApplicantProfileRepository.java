package com.job.manager.notification.repository;

import com.job.manager.notification.model.ApplicantProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApplicantProfileRepository extends MongoRepository<ApplicantProfile, String> {
}