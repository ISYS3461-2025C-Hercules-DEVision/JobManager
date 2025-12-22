package com.job.manager.notification.controller;

import com.job.manager.notification.dto.CompanySearchProfileRequest;
import com.job.manager.notification.model.CompanySearchProfile;
import com.job.manager.notification.repository.CompanySearchProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanySearchProfileController {

    private final CompanySearchProfileRepository profileRepository;

    // TEMP: companyId in path; later you’ll read it from JWT
    @PutMapping("/{companyId}/search-profile")
    public ResponseEntity<Void> upsertSearchProfile(
            @PathVariable String companyId,
            @RequestBody CompanySearchProfileRequest request
    ) {
        CompanySearchProfile profile = profileRepository
                .findByCompanyId(companyId)
                .orElseGet(CompanySearchProfile::new);

        profile.setCompanyId(companyId);
        profile.setTechnicalTags(request.getTechnicalTags());
        profile.setEmploymentStatus(request.getEmploymentStatus());
        profile.setCountry(request.getCountry());
        profile.setSalaryMin(request.getSalaryMin());
        profile.setSalaryMax(request.getSalaryMax());
        profile.setHighestEducationDegree(request.getHighestEducationDegree());

        profileRepository.save(profile);
        return ResponseEntity.ok().build();
    }
}