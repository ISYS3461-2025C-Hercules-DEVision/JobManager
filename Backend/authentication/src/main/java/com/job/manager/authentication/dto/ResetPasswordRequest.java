package com.job.manager.authentication.dto;

import com.job.manager.authentication.annotation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String code;

    @NotBlank(message = "Password is required")
    @StrongPassword
    private String newPassword;
}
