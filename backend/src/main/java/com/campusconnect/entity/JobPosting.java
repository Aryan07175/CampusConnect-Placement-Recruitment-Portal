package com.campusconnect.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_postings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    @JsonIgnoreProperties({"roles", "password", "hibernateLazyInitializer", "handler"})
    private User recruiter;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    // Required skills: comma-separated for MVP
    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(length = 50)
    private String jobType;       // Full-time, Part-time, Internship, Contract

    @Column(length = 100)
    private String location;

    private Boolean remote;

    @Column(length = 50)
    private String salaryRange;   // e.g. "12-18 LPA"

    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.ACTIVE;

    @Column(length = 100)
    private String experienceLevel;  // Fresher, 0-1yr, 1-3yr

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum JobStatus {
        ACTIVE, CLOSED, DRAFT
    }

    /** Returns required skills as a normalized list for matching */
    public List<String> getRequiredSkillList() {
        if (requiredSkills == null || requiredSkills.isBlank()) return new ArrayList<>();
        List<String> list = new ArrayList<>();
        for (String s : requiredSkills.split(",")) {
            String trimmed = s.trim().toLowerCase();
            if (!trimmed.isEmpty()) list.add(trimmed);
        }
        return list;
    }
}
