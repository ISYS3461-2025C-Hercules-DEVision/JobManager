package com.job.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RegisterRequest {
    private String companyId;
    private String companyName;
    private String city;
    private String address;
    private String password;
    private String email;
    private String phoneNumber;
    private String country;
}
