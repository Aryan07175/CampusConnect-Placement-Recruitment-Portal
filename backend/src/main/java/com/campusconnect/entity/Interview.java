package com.campusconnect.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a single interview round scheduled for an application.
 * One Application can have multiple Interview rows (one per round).
 */
@Entity
@Table(name = "interviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"student", "job", "hibernateLazyInitializer", "handler"})
    private Application application;

    /** Interview round label */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InterviewRound round = InterviewRound.SCREENING;

    /** When the interview is scheduled */
    @NotNull
    private LocalDateTime scheduledAt;

    /** Duration in minutes */
    @Column(nullable = false)
    @Builder.Default
    private Integer durationMinutes = 60;

    /** Online / Offline / Phone */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InterviewMode mode = InterviewMode.ONLINE;

    /** Physical location for offline interviews */
    @Column(length = 255)
    private String location;

    /** Video call link for online interviews */
    @Column(length = 500)
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    /** Recruiter's feedback / notes after the interview */
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ── Enums ────────────────────────────────────────────────────────────────

    public enum InterviewRound {
        SCREENING, TECHNICAL_1, TECHNICAL_2, HR, MANAGERIAL, FINAL
    }

    public enum InterviewMode {
        ONLINE, OFFLINE, PHONE
    }

    public enum InterviewStatus {
        SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    }
}
