package com.job.manager.company.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Specialized error response for validation failures.
 * Extends the standard error response by adding field-specific error details.
 * 
 * When a request contains multiple validation errors (e.g., invalid email format
 * AND missing required field), this structure allows returning all errors at once,
 * preventing the frustrating experience of fixing one error only to discover another.
 * 
 * Example response:
 * {
 *   "timestamp": "2025-12-18T10:30:00",
 *   "status": 400,
 *   "error": "Validation Error",
 *   "message": "Invalid input data",
 *   "fieldErrors": {
 *     "email": "Invalid email format",
 *     "phoneNumber": "Phone number must be 10-15 digits"
 *   }
 * }
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidationErrorResponse {
    /** The exact time when validation failed */
    private LocalDateTime timestamp;
    
    /** HTTP status code (always 400 for validation errors) */
    private int status;
    
    /** Error category (typically "Validation Error") */
    private String error;
    
    /** General validation failure message */
    private String message;
    
    /** Map of field names to their specific error messages (e.g., "email" -> "Invalid email format") */
    private Map<String, String> fieldErrors;
}
