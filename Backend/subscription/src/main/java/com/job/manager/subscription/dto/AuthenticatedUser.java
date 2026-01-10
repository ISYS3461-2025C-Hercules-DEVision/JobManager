package com.job.manager.subscription.dto;

import lombok.Data;

import java.util.List;

@Data
public class AuthenticatedUser {

    private String userId;  // from "id" claim
    private String email;   // from "email" or "sub"
    private List<String> roles;
}