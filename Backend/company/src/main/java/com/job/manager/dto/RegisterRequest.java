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
    private String companyName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String password;
    private String companyId;
    //todo: add remaining fields
}
