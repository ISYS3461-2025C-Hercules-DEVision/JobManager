package com.job.manager.company.repository;

import com.job.manager.company.entity.PublicProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PublicProfileRepository extends MongoRepository<PublicProfile, String> {
    
    Optional<PublicProfile> findByCompanyId(String companyId);
    
    List<PublicProfile> findByCountry(String country);
    
    List<PublicProfile> findByIndustryDomain(String industryDomain);
    
    List<PublicProfile> findByCountryAndIndustryDomain(String country, String industryDomain);
    
    boolean existsByCompanyId(String companyId);
}
