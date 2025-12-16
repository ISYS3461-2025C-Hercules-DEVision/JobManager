package com.job.manager.dto;

import com.job.manager.authentication.annotation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @NotBlank
    @StrongPassword
    private String password;

    @NotBlank
    @Email(message = "Invalid email format")
    @Size(max = 254)
    private String email;


    @Pattern(
            regexp = "^\\+84\\d{8,10}$",
            message = "Phone number must start with +84 and contain only digits"
    )
    private String phoneNumber;

    @NotBlank
    private String country;
}
