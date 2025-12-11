package com.job.manager.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CompanyProfileUpdateDto {
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String password;
    private String companyId;
    //todo: add remaining fields
}