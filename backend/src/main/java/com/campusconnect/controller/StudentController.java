package com.campusconnect.controller;

import com.campusconnect.dto.StudentProfileRequest;
import com.campusconnect.entity.Application;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.ApplicationService;
import com.campusconnect.service.JobPostingService;
import com.campusconnect.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentController {

    private final StudentProfileService profileService;
    private final JobPostingService jobPostingService;
    private final ApplicationService applicationService;

    // ── Profile ───────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<StudentProfile> getProfile(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfile> upsertProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody StudentProfileRequest req) {
        return ResponseEntity.ok(profileService.upsertProfile(user.getId(), req));
    }

    @PostMapping(value = "/profile/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentProfile> uploadResume(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(profileService.uploadResume(user.getId(), file));
    }

    // ── Job Listings ──────────────────────────────────────────────────────

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobPosting>> browseJobs(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(jobPostingService.getActiveJobs(keyword, pageable));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobPosting> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getById(id));
    }

    // ── Applications ──────────────────────────────────────────────────────

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<Application> apply(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long jobId,
            @RequestBody(required = false) Map<String, String> body) {
        String coverLetter = body != null ? body.get("coverLetter") : null;
        return ResponseEntity.ok(applicationService.apply(user.getId(), jobId, coverLetter));
    }

    @GetMapping("/applications")
    public ResponseEntity<Page<Application>> myApplications(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getStudentApplications(user.getId(), pageable));
    }
}
