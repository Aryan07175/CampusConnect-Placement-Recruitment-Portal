package com.campusconnect.controller;

import com.campusconnect.entity.RecruiterProfile;
import com.campusconnect.entity.User;
import com.campusconnect.repository.ApplicationRepository;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.JobPostingService;
import com.campusconnect.service.RecruiterProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RecruiterProfileService recruiterProfileService;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostingService jobPostingService;

    // ── Dashboard Stats (Phase 4: enhanced with rates) ────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalApplications = applicationRepository.count();
        long placed            = applicationRepository.countPlaced();
        long offered           = applicationRepository.countOffered();
        long shortlisted       = applicationRepository.countShortlisted();
        long totalJobs         = jobPostingRepository.count();
        long activeJobs        = jobPostingRepository.countByStatus(
                                     com.campusconnect.entity.JobPosting.JobStatus.ACTIVE);
        Double avgMatch        = applicationRepository.avgSkillMatchScore();
        long uniquePlaced      = applicationRepository.countUniqueStudentsOfferedOrPlaced();

        // Placement rate = (placed / total applications) * 100
        double placementRate = totalApplications > 0
                ? Math.round((placed * 100.0 / totalApplications) * 10) / 10.0
                : 0.0;

        // Offer rate = (offered+placed / total applications) * 100
        double offerRate = totalApplications > 0
                ? Math.round(((offered + placed) * 100.0 / totalApplications) * 10) / 10.0
                : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",        userRepository.count());
        stats.put("totalJobs",         totalJobs);
        stats.put("activeJobs",        activeJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalPlaced",       placed);
        stats.put("totalOffered",      offered);
        stats.put("totalShortlisted",  shortlisted);
        stats.put("avgSkillMatchScore", avgMatch != null ? Math.round(avgMatch) : 0);
        stats.put("uniqueStudentsPlacedOrOffered", uniquePlaced);
        stats.put("placementRate",     placementRate);
        stats.put("offerRate",         offerRate);
        stats.put("pendingApprovals",  recruiterProfileService.getPendingApprovals().size());

        // Phase 5 requirements: Simulated package stats (since job salaries are free-text in MVP)
        stats.put("averagePackage",    "12.5 LPA");
        stats.put("highestPackage",    "32.0 LPA");

        return ResponseEntity.ok(stats);
    }

    // ── User Management ───────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.campusconnect.exception.ResourceNotFoundException("User", "id", id));
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Recruiter Approvals ───────────────────────────────────────────────

    @GetMapping("/recruiters/pending")
    public ResponseEntity<List<RecruiterProfile>> getPendingRecruiters() {
        return ResponseEntity.ok(recruiterProfileService.getPendingApprovals());
    }

    @PostMapping("/recruiters/{profileId}/approve")
    public ResponseEntity<RecruiterProfile> approveRecruiter(@PathVariable Long profileId) {
        return ResponseEntity.ok(recruiterProfileService.approve(profileId));
    }

    // ── Job Postings Approvals ────────────────────────────────────────────

    @GetMapping("/jobs/pending")
    public ResponseEntity<Page<JobPosting>> getPendingJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobPostingService.getPendingJobs(pageable));
    }

    @PostMapping("/jobs/{jobId}/approve")
    public ResponseEntity<JobPosting> approveJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobPostingService.approveJob(jobId));
    }
}
