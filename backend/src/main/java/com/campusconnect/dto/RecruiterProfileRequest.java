package com.campusconnect.dto;

import lombok.Data;

@Data
public class RecruiterProfileRequest {
    private String companyName;
    private String companyWebsite;
    private String industry;
    private String companyDescription;
    private String companySize;
    private String headquarters;
}
