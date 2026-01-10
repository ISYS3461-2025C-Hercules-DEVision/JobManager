package com.job.manager.company.repository;

import com.job.manager.company.entity.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends MongoRepository<Company, String> {

    Optional<Company> findByEmail(String email);

    List<Company> findByCountry(String country);

    List<Company> findByIsPremium(Boolean isPremium);

    List<Company> findByIsActive(Boolean isActive);

    @Query("{ 'country': ?0, 'isPremium': ?1 }")
    List<Company> findByCountryAndPremiumStatus(String country, Boolean isPremium);

    boolean existsByEmail(String email);
}