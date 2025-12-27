package com.job.manager.subscription.exception;

/**
 * Custom exception for business validation failures.
 * Used to signal validation errors with clear, user-friendly messages.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
