package com.job.manager.job.dto;

import java.util.List;

public class AuthenticatedUser {

    private String userId;
    private String email;
    private List<String> roles;

    public AuthenticatedUser() {
    }

    // ✅ getters
    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    // ✅ setters (THIS is what you're missing)
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
