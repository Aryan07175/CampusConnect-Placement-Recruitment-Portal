package com.campusconnect.dto;

import com.campusconnect.entity.JobPosting.JobStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JobPostingRequest {
    @NotBlank private String title;
    @NotBlank private String companyName;
    private String description;
    private String responsibilities;
    private String requirements;
    private String requiredSkills;    // comma-separated
    @NotBlank(message = "Job type is required")
    private String jobType;           // Full-time, Internship, etc.
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private Boolean remote;
    
    @NotBlank(message = "Salary range is required")
    private String salaryRange;
    
    @FutureOrPresent(message = "Deadline cannot be in the past")
    private LocalDate applicationDeadline;
    
    @NotBlank(message = "Experience level is required")
    private String experienceLevel;
    
    private JobStatus status;
}
