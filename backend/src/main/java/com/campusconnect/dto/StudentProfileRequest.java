package com.campusconnect.dto;

import lombok.Data;

import java.util.List;

@Data
public class StudentProfileRequest {
    private String college;
    private String degree;
    private String branch;
    private Integer graduationYear;
    private Double cgpa;
    private String skills;          // comma-separated: "Java,React,MySQL"
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
