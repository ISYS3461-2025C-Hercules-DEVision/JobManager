package com.job.manager.authentication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthCodeRequest {
    @NotBlank
    private String code;
}

