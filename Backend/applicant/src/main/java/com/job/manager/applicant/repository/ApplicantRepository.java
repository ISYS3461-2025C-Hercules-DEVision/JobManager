package com.job.manager.applicant.repository;

import com.job.manager.applicant.entity.Applicant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ApplicantRepository extends MongoRepository<Applicant, String> {
    
    Optional<Applicant> findByApplicantId(String applicantId);
    
    // Full-Text Search (Requirement 5.2.1)
    // Searches across workExperience, objectiveSummary, and technicalTags
    @Query("{ $text: { $search: ?0 } }")
    List<Applicant> searchByText(String searchText);
    
    // Search by city (case-insensitive)
    @Query("{ 'city': { $regex: ?0, $options: 'i' } }")
    List<Applicant> findByCity(String city);
    
    // Search by country (case-insensitive)
    @Query("{ 'country': { $regex: ?0, $options: 'i' } }")
    List<Applicant> findByCountry(String country);
    
    // Search by highest education degree
    List<Applicant> findByHighestEducationDegree(String degree);
    
    // Search by employment types
    List<Applicant> findByEmploymentTypesIn(Set<String> employmentTypes);
    
    // Search by technical tags with OR logic (Requirement 5.2.2)
    // Returns applicants who have ANY of the specified tags
    @Query("{ 'technicalTags': { $in: ?0 } }")
    List<Applicant> findByTechnicalTagsIn(List<String> technicalTags);
}
