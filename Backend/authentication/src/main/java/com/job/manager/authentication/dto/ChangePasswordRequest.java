package com.job.manager.authentication.dto;

import com.job.manager.authentication.annotation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @StrongPassword
    private String newPassword;
}
