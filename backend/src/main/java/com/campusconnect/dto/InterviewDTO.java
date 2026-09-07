package com.campusconnect.dto;

import com.campusconnect.entity.Interview;
import com.campusconnect.entity.Interview.InterviewMode;
import com.campusconnect.entity.Interview.InterviewRound;
import com.campusconnect.entity.Interview.InterviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Rich DTO returned for interview reads.
 * Flattens the nested Application → Student chain for convenient frontend consumption.
 */
@Data
@Builder
public class InterviewDTO {

    // ── Interview core ────────────────────────────────────────────────────
    private Long            interviewId;
    private InterviewRound  round;
    private LocalDateTime   scheduledAt;
    private Integer         durationMinutes;
    private InterviewMode   mode;
    private String          location;
    private String          meetingLink;
    private InterviewStatus status;
    private String          feedback;
    private LocalDateTime   createdAt;
    private LocalDateTime   updatedAt;

    // ── Application context ───────────────────────────────────────────────
    private Long   applicationId;
    private String applicationStatus;  // Application.ApplicationStatus.name()

    // ── Job context ───────────────────────────────────────────────────────
    private Long   jobId;
    private String jobTitle;
    private String companyName;

    // ── Student context (for recruiter view) ──────────────────────────────
    private Long   studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;

    // ── Factory ───────────────────────────────────────────────────────────
    public static InterviewDTO from(Interview i) {
        var app = i.getApplication();
        var job = app.getJob();
        var student = app.getStudent();

        return InterviewDTO.builder()
                .interviewId(i.getId())
                .round(i.getRound())
                .scheduledAt(i.getScheduledAt())
                .durationMinutes(i.getDurationMinutes())
                .mode(i.getMode())
                .location(i.getLocation())
                .meetingLink(i.getMeetingLink())
                .status(i.getStatus())
                .feedback(i.getFeedback())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .applicationId(app.getId())
                .applicationStatus(app.getStatus().name())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompanyName())
                .studentId(student.getId())
                .studentFirstName(student.getFirstName())
                .studentLastName(student.getLastName())
                .studentEmail(student.getEmail())
                .build();
    }
}
