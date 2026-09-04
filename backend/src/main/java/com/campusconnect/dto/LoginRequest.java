package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /** Accepts either username or email */
    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;
}
