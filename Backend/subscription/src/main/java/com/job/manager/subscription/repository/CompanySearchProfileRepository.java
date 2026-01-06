package com.job.manager.subscription.repository;

import com.job.manager.subscription.model.CompanySearchProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CompanySearchProfileRepository extends MongoRepository<CompanySearchProfile, String> {

    Optional<CompanySearchProfile> findByCompanyId(String companyId);

    void deleteByCompanyId(String companyId);

    // Later, if you want all active premium profiles:
    List<CompanySearchProfile> findAll();
}