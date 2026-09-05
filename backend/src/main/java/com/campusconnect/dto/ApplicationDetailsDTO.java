package com.campusconnect.dto;

import com.campusconnect.entity.Application;
import com.campusconnect.entity.Application.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Rich DTO returned to recruiters viewing applicants — includes student profile
 * data (skills, college, CGPA) alongside the application so one API call gives
 * everything needed to evaluate a candidate.
 */
@Data @Builder
public class ApplicationDetailsDTO {

    // ── Application ───────────────────────────────────────────────────────
    private Long              applicationId;
    private ApplicationStatus status;
    private Integer           skillMatchScore;
    private String            coverLetter;
    private String            recruiterNotes;
    private LocalDateTime     appliedAt;

    // ── Candidate (User) ──────────────────────────────────────────────────
    private Long   studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;
    private String studentUsername;

    // ── StudentProfile (may be null if student hasn't set it up yet) ──────
    private String       college;
    private String       degree;
    private String       branch;
    private Integer      graduationYear;
    private Double       cgpa;
    private List<String> skills;           // parsed from comma-separated
    private String       bio;
    private String       linkedinUrl;
    private String       githubUrl;
    private String       portfolioUrl;
    private boolean      hasResume;
    private String       resumeOriginalName;
    private boolean      profileComplete;
}
