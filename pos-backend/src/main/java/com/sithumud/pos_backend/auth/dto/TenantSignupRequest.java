package com.sithumud.pos_backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantSignupRequest {

    @NotBlank(message = "Signup token is required")
    private String signupToken;

    // Business details
    @NotBlank(message = "Business name is required")
    private String businessName;

    private String businessAddress;

    private String businessPhone;

    // Admin account details
    @NotBlank(message = "Admin name is required")
    private String adminName;

    @Email(message = "Valid admin email is required")
    @NotBlank(message = "Admin email is required")
    private String adminEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String adminPassword;
}
