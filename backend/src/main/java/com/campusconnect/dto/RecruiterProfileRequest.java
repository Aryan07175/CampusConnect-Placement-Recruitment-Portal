package com.campusconnect.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;


@Data
public class RecruiterProfileRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;
    private String companyWebsite;
    private String industry;
    private String companyDescription;
    private String companySize;
    private String headquarters;
}
