package com.job.manager.job.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Salary {
    
    private SalaryType type; // RANGE, ESTIMATION, NEGOTIABLE
    
    private Double min; // For RANGE type
    
    private Double max; // For RANGE type
    
    private Double value; // For ESTIMATION type
    
    private String prefix; // e.g., "About", "Up to"
    
    private String currency; // e.g., "USD", "EUR"
    
    public enum SalaryType {
        RANGE,        // e.g., "1000-1500 USD"
        ESTIMATION,   // e.g., "About 1000 USD"
        NEGOTIABLE    // Just "Negotiable"
    }
}
