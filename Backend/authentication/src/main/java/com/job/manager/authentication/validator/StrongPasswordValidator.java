package com.job.manager.authentication.validator;

import com.job.manager.authentication.annotation.StrongPassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class StrongPasswordValidator
        implements ConstraintValidator<StrongPassword, String> {

    private static final Pattern PATTERN = Pattern.compile(
            "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value != null && PATTERN.matcher(value).matches();
    }
}
