package com.campusconnect.dto;

import com.campusconnect.entity.Interview.InterviewMode;
import com.campusconnect.entity.Interview.InterviewRound;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for scheduling or updating an interview.
 */
@Data
public class InterviewRequest {

    // BUG-4 FIX: was @NotNull — PUT /interviews/{id} reuses this DTO for reschedule.
    // The interview is already linked; clients should not need to re-send applicationId.
    // Making it optional lets the update endpoint work naturally.
    private Long applicationId;

    private InterviewRound round = InterviewRound.SCREENING;

    @NotNull(message = "Scheduled date/time is required")
    @FutureOrPresent(message = "Interview must be scheduled now or in the future")
    private LocalDateTime scheduledAt;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes = 60;

    private InterviewMode mode = InterviewMode.ONLINE;

    private String location;

    private String meetingLink;
}
