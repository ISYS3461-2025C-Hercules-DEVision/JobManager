package com.job.manager.company.service;

import com.job.manager.company.dto.CompanyProfileUpdateDto;
import com.job.manager.company.entity.Company;
import com.job.manager.company.repository.CompanyRepository;
import com.job.manager.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public CompanyProfileUpdateDto updateProfile(String email, CompanyProfileUpdateDto updatedRequest) {
        Company company = companyRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with email: " + email));

        // Update fields
        company.setName(updatedRequest.getName());
        company.setAddress(updatedRequest.getAddress());
        company.setEmail(updatedRequest.getEmail());

        // Save updated company to the database
        company = companyRepository.save(company);

        // Map back to DTO
        CompanyProfileUpdateDto response = new CompanyProfileUpdateDto();
        response.setName(company.getName());
        response.setAddress(company.getAddress());
        response.setEmail(company.getEmail());

        return response;
    }

    public void registerProfile(RegisterRequest registerRequest) {
        Company newCompany = new Company();
        newCompany.setId(registerRequest.getCompanyId());
        newCompany.setEmail(registerRequest.getEmail());
        companyRepository.save(newCompany);
    }
}