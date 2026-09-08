package com.campusconnect.dto;

import lombok.Data;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class StudentProfileRequest {
    @NotBlank(message = "College is required")
    private String college;
    
    @NotBlank(message = "Degree is required")
    private String degree;
    
    @NotBlank(message = "Branch is required")
    private String branch;
    
    @NotNull(message = "Graduation year is required")
    @Min(1900) @Max(2100)
    private Integer graduationYear;
    
    @Min(0) @Max(10)
    private Double cgpa;
    
    private String skills;          // comma-separated: "Java,React,MySQL"
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
