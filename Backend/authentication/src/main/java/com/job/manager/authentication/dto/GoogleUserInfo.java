package com.job.manager.authentication.dto;

import lombok.Data;

@Data
public class GoogleUserInfo {
    private String sub;
    private String email;
}

