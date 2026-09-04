package com.campusconnect.controller;

import com.campusconnect.entity.RecruiterProfile;
import com.campusconnect.entity.User;
import com.campusconnect.repository.ApplicationRepository;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.RecruiterProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // ── Dashboard Stats ───────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",       userRepository.count());
        stats.put("totalJobs",        jobPostingRepository.count());
        stats.put("activeJobs",       jobPostingRepository.countByStatus(
                                          com.campusconnect.entity.JobPosting.JobStatus.ACTIVE));
        stats.put("totalApplications",applicationRepository.count());
        stats.put("totalPlaced",      applicationRepository.countPlaced());
        stats.put("totalOffered",     applicationRepository.countOffered());
        stats.put("pendingApprovals", recruiterProfileService.getPendingApprovals().size());
        return ResponseEntity.ok(stats);
    }

    // ── User Management ───────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
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
}
