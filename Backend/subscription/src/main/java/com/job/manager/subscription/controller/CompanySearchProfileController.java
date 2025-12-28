package com.job.manager.subscription.controller;

import com.job.manager.subscription.annotation.CurrentUser;
import com.job.manager.subscription.dto.AuthenticatedUser;
import com.job.manager.subscription.dto.CompanySearchProfileRequest;
import com.job.manager.subscription.dto.CompanySearchProfileResponse;
import com.job.manager.subscription.service.CompanySearchProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class CompanySearchProfileController {

    private final CompanySearchProfileService profileService;

    @PutMapping("/search-profile")
    public ResponseEntity<Void> upsertSearchProfile(
            @CurrentUser AuthenticatedUser user,
            @RequestBody CompanySearchProfileRequest request
    ) {
        String companyId = user.getUserId();  // from JWT "id"
        profileService.upsertProfile(companyId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search-profile")
    public ResponseEntity<CompanySearchProfileResponse> getSearchProfile(
            @CurrentUser AuthenticatedUser user
    ) {
        String companyId = user.getUserId();
        CompanySearchProfileResponse response = profileService.getProfile(companyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search-profiles")
    public ResponseEntity<List<CompanySearchProfileResponse>> getAllSearchProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }
}