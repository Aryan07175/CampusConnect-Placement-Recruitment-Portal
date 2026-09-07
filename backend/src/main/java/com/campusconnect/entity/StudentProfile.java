package com.campusconnect.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"roles", "password", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(length = 100)
    private String college;

    @Column(length = 100)
    private String degree;

    @Column(length = 100)
    private String branch;

    private Integer graduationYear;

    @Column(name = "cgpa", precision = 4)
    private Double cgpa;

    // Skills stored as comma-separated string for MVP; extend to separate table post-MVP
    @Column(columnDefinition = "TEXT")
    private String skills;          // e.g. "Java,Spring Boot,React,MySQL"

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(length = 255)
    private String githubUrl;

    @Column(length = 255)
    private String portfolioUrl;

    // Resume stored as relative path; file stored in uploads/resumes/
    @Column(length = 500)
    private String resumePath;

    @Column(length = 500)
    private String resumeOriginalName;

    @Column(nullable = false)
    @Builder.Default
    private boolean profileComplete = false;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Convenience: returns skills as a List for matching logic */
    public List<String> getSkillList() {
        if (skills == null || skills.isBlank()) return new ArrayList<>();
        List<String> list = new ArrayList<>();
        for (String s : skills.split(",")) {
            String trimmed = s.trim().toLowerCase();
            if (!trimmed.isEmpty()) list.add(trimmed);
        }
        return list;
    }
}
