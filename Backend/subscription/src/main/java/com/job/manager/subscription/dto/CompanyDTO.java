package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for company information received from the company service.
 * Used to validate company existence and retrieve basic company details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDTO {

    private String companyId;
    private String companyName;
    private String email;
    private Boolean isPremium;
    private Boolean isActive;
    private Boolean isEmailVerified;
}
