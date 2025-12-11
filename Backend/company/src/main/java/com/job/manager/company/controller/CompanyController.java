package com.job.manager.company.controller;

import com.job.manager.company.dto.CompanyProfileUpdateDto;
import com.job.manager.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PutMapping("/{companyId}/profile")
    public CompanyProfileUpdateDto updateProfile(@PathVariable String companyId, @RequestBody CompanyProfileUpdateDto requestDto) {
        var response = companyService.updateProfile(companyId, requestDto);
        return ResponseEntity.status(HttpStatus.OK)
                .body(response).getBody();
    }

}