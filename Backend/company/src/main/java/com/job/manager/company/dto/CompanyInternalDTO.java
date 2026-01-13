package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for internal service-to-service company information requests.
 * Used by other microservices to validate company existence and get basic info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInternalDTO {

    private String companyId;
    private String companyName;
    private String email;
    private Boolean isPremium;
    private Boolean isActive;
    private Boolean isEmailVerified;

}
