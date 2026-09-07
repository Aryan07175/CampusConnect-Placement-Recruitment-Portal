package com.campusconnect.controller;

import com.campusconnect.dto.JobRecommendationDTO;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.SkillMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Phase 4 — Job recommendation endpoint.
 *
 * GET /api/recommendations/student/{studentId}
 *   Returns all ACTIVE jobs scored against the student's skill set,
 *   sorted by matchScore descending.
 *
 * GET /api/recommendations/me
 *   Convenience alias — uses the JWT principal, no path variable needed.
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final SkillMatchService skillMatchService;

    /**
     * Recommend jobs for the currently authenticated student.
     * Frontend calls this to overlay "X% Match" badges on job cards.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobRecommendationDTO>> getMyRecommendations(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(skillMatchService.getRecommendationsForStudent(user.getId()));
    }

    /**
     * Admin / recruiter can query recommendations for any student by ID.
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<List<JobRecommendationDTO>> getStudentRecommendations(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(skillMatchService.getRecommendationsForStudent(studentId));
    }
}
