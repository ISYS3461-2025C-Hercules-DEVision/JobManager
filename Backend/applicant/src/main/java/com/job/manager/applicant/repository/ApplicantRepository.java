package com.job.manager.applicant.repository;

import com.job.manager.applicant.entity.Applicant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicantRepository extends MongoRepository<Applicant, String> {
    
    Optional<Applicant> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
