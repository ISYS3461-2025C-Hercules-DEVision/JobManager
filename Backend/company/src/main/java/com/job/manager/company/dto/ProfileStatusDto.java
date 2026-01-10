package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileStatusDto {
    private String companyId;
    private boolean hasPublicProfile;  // Changed from Boolean to boolean primitive
}