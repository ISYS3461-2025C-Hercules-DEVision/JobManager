package com.job.manager.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCreateDTO {
    
    @NotNull(message = "Company ID is required")
    private String companyId;
    
    @NotNull(message = "Plan type is required")
    private String planType; // "FREE" or "PREMIUM"
}
