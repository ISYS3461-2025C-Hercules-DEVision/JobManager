package com.job.manager.authentication.annotation;

import com.job.manager.authentication.validator.StrongPasswordValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({ FIELD })
@Retention(RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
    String message() default
            "Password must have 8 chars, 1 uppercase, 1 number, 1 special char";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}