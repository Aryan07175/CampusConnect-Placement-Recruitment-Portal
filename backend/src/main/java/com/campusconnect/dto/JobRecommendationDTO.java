package com.campusconnect.dto;

import com.campusconnect.entity.JobPosting;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lightweight job card enriched with the student's skill-match score.
 * Returned by GET /api/recommendations/student/{id}
 */
@Data
@Builder
public class JobRecommendationDTO {

    // ── Job core fields ───────────────────────────────────────────────────
    private Long          jobId;
    private String        title;
    private String        companyName;
    private String        jobType;
    private String        location;
    private Boolean       remote;
    private String        salaryRange;
    private String        requiredSkills;    // raw comma-separated string
    private String        experienceLevel;
    private LocalDate     applicationDeadline;
    private LocalDateTime postedAt;

    // ── Matching ──────────────────────────────────────────────────────────
    private int    matchScore;        // 0–100
    private String matchLabel;        // "Excellent Match", "Good Match", etc.

    // ── Factory ───────────────────────────────────────────────────────────
    public static JobRecommendationDTO from(JobPosting job, int score, String label) {
        return JobRecommendationDTO.builder()
                .jobId(job.getId())
                .title(job.getTitle())
                .companyName(job.getCompanyName())
                .jobType(job.getJobType())
                .location(job.getLocation())
                .remote(job.getRemote())
                .salaryRange(job.getSalaryRange())
                .requiredSkills(job.getRequiredSkills())
                .experienceLevel(job.getExperienceLevel())
                .applicationDeadline(job.getApplicationDeadline())
                .postedAt(job.getCreatedAt())
                .matchScore(score)
                .matchLabel(label)
                .build();
    }
}
