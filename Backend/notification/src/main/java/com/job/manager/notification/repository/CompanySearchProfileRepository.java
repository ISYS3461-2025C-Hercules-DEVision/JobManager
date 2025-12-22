package com.job.manager.notification.repository;

import com.job.manager.notification.model.CompanySearchProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CompanySearchProfileRepository extends MongoRepository<CompanySearchProfile, String> {
    Optional<CompanySearchProfile> findByCompanyId(String companyId);
}