package com.job.manager.company.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the Company Service.
 * This centralized error handling approach ensures consistent error responses
 * across all REST endpoints, improving API reliability and client experience.
 * 
 * Instead of letting Spring Boot return default error pages or stack traces,
 * this handler intercepts exceptions and returns structured JSON responses
 * with appropriate HTTP status codes.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles business logic exceptions thrown by service layer.
     * These are intentional exceptions representing business rule violations
     * (e.g., "Company not found", "Maximum media limit reached").
     * 
     * @param ex The business exception containing a user-friendly error message
     * @return ResponseEntity with error details and HTTP 400 status
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Business Error")
                .message(ex.getMessage())
                .build();
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles validation errors from Jakarta Bean Validation annotations.
     * When a request fails validation (e.g., @NotBlank, @Email, @Pattern),
     * this method extracts all field errors and returns them in a structured format.
     * 
     * This allows clients to display specific error messages for each invalid field,
     * improving user experience by clearly indicating what needs to be corrected.
     * 
     * @param ex The validation exception containing all field errors
     * @return ResponseEntity with field-level error details and HTTP 400 status
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse response = ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Error")
                .message("Invalid input data")
                .fieldErrors(errors)
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Catches any unhandled exceptions that slip through specific handlers.
     * This is a safety net to prevent the application from returning stack traces
     * or default error pages to clients, which could expose sensitive information.
     * 
     * All unexpected errors are logged (implicitly) and returned as generic
     * "Internal Server Error" responses with HTTP 500 status.
     * 
     * @param ex The unexpected exception that was not caught by other handlers
     * @return ResponseEntity with generic error message and HTTP 500 status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred: " + ex.getMessage())
                .build();
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
