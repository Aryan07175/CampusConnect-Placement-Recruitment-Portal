package com.campusconnect.service;

import com.campusconnect.dto.InterviewDTO;
import com.campusconnect.dto.InterviewRequest;
import com.campusconnect.entity.Application;
import com.campusconnect.entity.Interview;
import com.campusconnect.entity.Interview.InterviewStatus;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.ApplicationRepository;
import com.campusconnect.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * Schedule a new interview for an application.
     * Validates that the application exists and the job belongs to the recruiter.
     */
    @Transactional
    public InterviewDTO schedule(Long recruiterId, InterviewRequest req) {
        Application app = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", req.getApplicationId()));

        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to schedule interviews for this application.");
        }

        Interview interview = Interview.builder()
                .application(app)
                .round(req.getRound() != null ? req.getRound() : Interview.InterviewRound.SCREENING)
                .scheduledAt(req.getScheduledAt())
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 60)
                .mode(req.getMode() != null ? req.getMode() : Interview.InterviewMode.ONLINE)
                .location(req.getLocation())
                .meetingLink(req.getMeetingLink())
                .status(InterviewStatus.SCHEDULED)
                .build();

        // Auto-advance application status to SHORTLISTED when first interview is scheduled
        if (app.getStatus() == Application.ApplicationStatus.APPLIED
                || app.getStatus() == Application.ApplicationStatus.UNDER_REVIEW) {
            app.setStatus(Application.ApplicationStatus.SHORTLISTED);
            applicationRepository.save(app);
        }

        return InterviewDTO.from(interviewRepository.save(interview));
    }

    /**
     * Update scheduling details of an existing interview (reschedule).
     */
    @Transactional
    public InterviewDTO update(Long recruiterId, Long interviewId, InterviewRequest req) {
        Interview interview = findAndAuthorize(interviewId, recruiterId);

        if (req.getScheduledAt() != null) interview.setScheduledAt(req.getScheduledAt());
        if (req.getDurationMinutes() != null) interview.setDurationMinutes(req.getDurationMinutes());
        if (req.getMode() != null) interview.setMode(req.getMode());
        if (req.getLocation() != null) interview.setLocation(req.getLocation());
        if (req.getMeetingLink() != null) interview.setMeetingLink(req.getMeetingLink());
        if (req.getRound() != null) interview.setRound(req.getRound());
        interview.setStatus(InterviewStatus.RESCHEDULED);

        return InterviewDTO.from(interviewRepository.save(interview));
    }

    /**
     * Update the status of an interview (COMPLETED, CANCELLED, etc.) and optionally add feedback.
     */
    @Transactional
    public InterviewDTO updateStatus(Long recruiterId, Long interviewId, String status, String feedback) {
        Interview interview = findAndAuthorize(interviewId, recruiterId);
        interview.setStatus(InterviewStatus.valueOf(status));
        if (feedback != null) interview.setFeedback(feedback);
        return InterviewDTO.from(interviewRepository.save(interview));
    }

    /**
     * Get all interviews for a specific application (recruiter view).
     */
    public List<InterviewDTO> getByApplication(Long applicationId) {
        return interviewRepository.findByApplicationIdOrderByScheduledAt(applicationId)
                .stream().map(InterviewDTO::from).collect(Collectors.toList());
    }

    /**
     * Get a student's upcoming scheduled interviews (student dashboard widget).
     */
    public List<InterviewDTO> getUpcomingForStudent(Long studentUserId) {
        return interviewRepository.findUpcomingByStudent(studentUserId, LocalDateTime.now())
                .stream().map(InterviewDTO::from).collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Interview findAndAuthorize(Long interviewId, Long recruiterId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));
        if (!interview.getApplication().getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to modify this interview.");
        }
        return interview;
    }
}
