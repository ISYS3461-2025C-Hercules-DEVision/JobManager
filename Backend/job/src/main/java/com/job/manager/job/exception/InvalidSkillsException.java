package com.job.manager.job.exception;

/**
 * Exception thrown when job post skills validation fails
 */
public class InvalidSkillsException extends RuntimeException {
    
    public InvalidSkillsException(String message) {
        super(message);
    }
}
