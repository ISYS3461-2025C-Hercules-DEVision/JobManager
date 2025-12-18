package com.job.manager.company.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response structure for all API errors.
 * This DTO ensures consistent error formatting across the entire Company Service,
 * making it easier for clients to parse and display errors.
 * 
 * The structure follows common REST API error response patterns,
 * providing both machine-readable status codes and human-readable messages.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    /** The exact time when the error occurred, useful for debugging and logging correlation */
    private LocalDateTime timestamp;
    
    /** HTTP status code (e.g., 400, 404, 500) for programmatic error handling */
    private int status;
    
    /** Brief error category (e.g., "Business Error", "Internal Server Error") */
    private String error;
    
    /** Detailed human-readable error message explaining what went wrong */
    private String message;
}
