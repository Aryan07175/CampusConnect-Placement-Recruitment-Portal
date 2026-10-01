package com.campusconnect.service;

import com.campusconnect.dto.JobRecommendationDTO;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * MVP skill-matching engine.
 *
 * Score = (# of required skills present in student's skill list) / (# required skills) × 100
 * Returns 0 if the job has no required skills.
 * Case-insensitive comparison.
 */
@Service
@RequiredArgsConstructor
public class SkillMatchService {

    private final JobPostingRepository jobPostingRepository;
    private final StudentProfileRepository studentProfileRepository;

    public int computeScore(StudentProfile student, JobPosting job) {
        List<String> required = job.getRequiredSkillList();
        // BUG-19 FIX: if the job has no required skills it is open to everyone.
        // Returning 0 was ambiguous — it showed as "No Match" in the UI badge.
        // Return 100 to correctly signal "Everyone qualifies".
        if (required.isEmpty()) return 100;

        List<String> studentSkills = student.getSkillList();
        long matched = required.stream()
                .filter(req -> studentSkills.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(req)))
                .count();

        return (int) Math.round((double) matched / required.size() * 100);
    }

    /**
     * Returns a label for the score, useful for badge display.
     */
    public String scoreLabel(int score) {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Partial Match";
        if (score > 0)   return "Low Match";
        return "No Match";
    }

    /**
     * Phase 4 — Recommendation engine.
     * Fetches all ACTIVE jobs, computes match score for the given student,
     * and returns them sorted by score descending.
     */
    public List<JobRecommendationDTO> getRecommendationsForStudent(Long studentUserId) {
        // BUG-03 FIX: A new student who hasn't created a profile yet should still
        // see all active jobs (with matchScore = 0) rather than getting a 404
        // that causes the frontend to silently show "No jobs found".
        StudentProfile profile = studentProfileRepository.findByUserId(studentUserId)
                .orElse(null);

        // Fetch up to 200 active jobs (sufficient for campus portal scale)
        List<JobPosting> activeJobs = jobPostingRepository
                .findByStatus(JobPosting.JobStatus.ACTIVE, PageRequest.of(0, 200))
                .getContent();

        return activeJobs.stream()
                .map(job -> {
                    int score = (profile != null) ? computeScore(profile, job) : 0;
                    String label = (profile != null) ? scoreLabel(score) : "Create your profile to see match";
                    return JobRecommendationDTO.from(job, score, label);
                })
                .sorted(Comparator.comparingInt(JobRecommendationDTO::getMatchScore).reversed())
                .collect(Collectors.toList());
    }
}
