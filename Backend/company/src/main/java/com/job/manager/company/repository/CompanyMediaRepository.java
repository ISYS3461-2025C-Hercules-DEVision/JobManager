package com.job.manager.company.repository;

import com.job.manager.company.entity.CompanyMedia;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CompanyMediaRepository extends MongoRepository<CompanyMedia, String> {
    
    List<CompanyMedia> findByCompanyId(String companyId);
    
    List<CompanyMedia> findByCompanyIdAndIsActive(String companyId, Boolean isActive);
    
    List<CompanyMedia> findByCompanyIdOrderByOrderIndexAsc(String companyId);
    
    List<CompanyMedia> findByCompanyIdAndMediaType(String companyId, CompanyMedia.MediaType mediaType);
    
    void deleteByCompanyId(String companyId);
    
    long countByCompanyId(String companyId);
}
