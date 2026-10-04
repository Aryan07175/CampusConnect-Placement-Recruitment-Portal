package com.campusconnect.dto;

import lombok.Data;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Data
public class StudentProfileRequest {
    // All fields are optional to allow partial/incremental profile saves.
    // The service layer uses null-checks to decide which fields to update.
    private String college;
    private String degree;
    private String branch;

    @Min(value = 1900, message = "Graduation year must be after 1900")
    @Max(value = 2100, message = "Graduation year must be before 2100")
    private Integer graduationYear;

    @Min(value = 0, message = "CGPA must be >= 0")
    @Max(value = 10, message = "CGPA must be <= 10")
    private Double cgpa;

    private String skills;          // comma-separated: "Java,React,MySQL"
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
