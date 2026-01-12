package com.job.manager.job.dto;

import com.job.manager.job.enums.SalaryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for job post responses
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobPostResponse {

    private UUID id;
    
    private String companyId;
    
    private String title;
    
    private String department;
    
    private String description;
    
    private List<String> employmentTypes;
    
    private LocalDate postedDate;
    
    private LocalDate expiryDate;
    
    private SalaryType salaryType;
    
    private BigDecimal salaryMin;
    
    private BigDecimal salaryMax;
    
    private String salaryCurrency;
    
    /**
     * Formatted salary string for display
     * e.g., "1000-1500 USD", "About 1000 USD", "Negotiable"
     */
    private String salaryDisplay;
    
    private String location;
    
    private boolean published;
    
    private List<String> skills;
    
    /**
     * Generates a human-readable salary display string
     */
    public static String generateSalaryDisplay(SalaryType type, BigDecimal min, BigDecimal max, String currency) {
        if (type == null || currency == null) {
            return "Not specified";
        }
        
        switch (type) {
            case RANGE:
                return String.format("%s-%s %s", min, max, currency);
            case ABOUT:
                return String.format("About %s %s", min, currency);
            case UP_TO:
                return String.format("Up to %s %s", max, currency);
            case FROM:
                return String.format("From %s %s", min, currency);
            case NEGOTIABLE:
                return "Negotiable";
            default:
                return "Not specified";
        }
    }
}
