package com.campusconnect.dto;

import com.campusconnect.entity.Interview.InterviewMode;
import com.campusconnect.entity.Interview.InterviewRound;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for scheduling or updating an interview.
 */
@Data
public class InterviewRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    private InterviewRound round = InterviewRound.SCREENING;

    @NotNull(message = "Scheduled date/time is required")
    @Future(message = "Interview must be scheduled in the future")
    private LocalDateTime scheduledAt;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes = 60;

    private InterviewMode mode = InterviewMode.ONLINE;

    private String location;

    private String meetingLink;
}
