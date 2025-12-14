package com.job.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class VerifyEmailRequest {
    @NotBlank
    private String userName;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String code;
}
