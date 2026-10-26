package com.campusconnect.controller;

import com.campusconnect.dto.ApplicationDetailsDTO;
import com.campusconnect.dto.InterviewDTO;
import com.campusconnect.dto.InterviewRequest;
import com.campusconnect.dto.JobPostingRequest;
import com.campusconnect.dto.RecruiterProfileRequest;
import com.campusconnect.entity.Application;
import com.campusconnect.entity.Application.ApplicationStatus;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.RecruiterProfile;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.ApplicationService;
import com.campusconnect.service.InterviewService;
import com.campusconnect.service.JobPostingService;
import com.campusconnect.service.RecruiterProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasRole('RECRUITER')")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterProfileService profileService;
    private final JobPostingService jobPostingService;
    private final ApplicationService applicationService;
    private final InterviewService interviewService;

    // ── Profile ───────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<RecruiterProfile> getProfile(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterProfile> upsertProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody RecruiterProfileRequest req) {
        return ResponseEntity.ok(profileService.upsertProfile(user.getId(), req));
    }

    // ── Job Postings ──────────────────────────────────────────────────────

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobPosting>> myJobs(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobPostingService.getByRecruiter(user.getId(), pageable));
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobPosting> createJob(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody JobPostingRequest req) {
        return ResponseEntity.ok(jobPostingService.create(user.getId(), req));
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<JobPosting> updateJob(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long jobId,
            @Valid @RequestBody JobPostingRequest req) {
        return ResponseEntity.ok(jobPostingService.update(user.getId(), jobId, req));
    }

    @PatchMapping("/jobs/{jobId}/status")
    public ResponseEntity<JobPosting> toggleJobStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long jobId,
            @RequestBody Map<String, String> body) {
        String rawStatus = body != null ? body.get("status") : null;
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new BadRequestException("Job status is required.");
        }
        JobPosting.JobStatus status;
        try {
            status = JobPosting.JobStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid job status: '" + rawStatus + "'. Allowed values: DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED.");
        }
        return ResponseEntity.ok(jobPostingService.updateStatus(user.getId(), jobId, status));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long jobId) {
        jobPostingService.delete(user.getId(), jobId);
        return ResponseEntity.noContent().build();
    }

    // ── Applications (Phase 3: returns rich ApplicationDetailsDTO) ────────

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<Page<ApplicationDetailsDTO>> getApplications(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long jobId,
            @PageableDefault(size = 20, sort = "skillMatchScore", direction = Sort.Direction.DESC) Pageable pageable) {
        // BUG-03 FIX: pass recruiterId so the service enforces job ownership
        return ResponseEntity.ok(applicationService.getJobApplicationsWithDetails(jobId, user.getId(), pageable));
    }

    @PatchMapping("/applications/{appId}/status")
    public ResponseEntity<Application> updateStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appId,
            @RequestBody Map<String, String> body) {
        String rawStatus = body != null ? body.get("status") : null;
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new BadRequestException("Application status is required.");
        }
        ApplicationStatus status;
        try {
            status = ApplicationStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid application status: '" + rawStatus + "'. Allowed values: APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, REJECTED, OFFERED, PLACED.");
        }
        String notes = body != null ? body.get("notes") : null;
        // BUG-06 FIX: pass recruiterId so the service can verify ownership
        return ResponseEntity.ok(applicationService.updateStatus(appId, user.getId(), status, notes));
    }

    // ── Interviews (Phase 3) ─────────────────────────────────────────────

    @PostMapping("/interviews")
    public ResponseEntity<InterviewDTO> scheduleInterview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody InterviewRequest req) {
        return ResponseEntity.ok(interviewService.schedule(user.getId(), req));
    }

    @PutMapping("/interviews/{interviewId}")
    public ResponseEntity<InterviewDTO> updateInterview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewRequest req) {
        return ResponseEntity.ok(interviewService.update(user.getId(), interviewId, req));
    }

    @PatchMapping("/interviews/{interviewId}/status")
    public ResponseEntity<InterviewDTO> updateInterviewStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long interviewId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                interviewService.updateStatus(user.getId(), interviewId,
                        body.get("status"), body.get("feedback")));
    }

    @GetMapping("/applications/{appId}/interviews")
    public ResponseEntity<List<InterviewDTO>> getInterviewsByApplication(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long appId) {
        // BUG-D FIX: pass recruiterId so the service enforces job ownership
        return ResponseEntity.ok(interviewService.getByApplication(appId, user.getId()));
    }
}
