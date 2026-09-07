package com.campusconnect.service;

import com.campusconnect.dto.JobRecommendationDTO;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.exception.ResourceNotFoundException;
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
        if (required.isEmpty()) return 0;

        List<String> studentSkills = student.getSkillList();
        long matched = required.stream()
                .filter(req -> studentSkills.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(req) || s.contains(req) || req.contains(s)))
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
        StudentProfile profile = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        // Fetch up to 200 active jobs (sufficient for campus portal scale)
        List<JobPosting> activeJobs = jobPostingRepository
                .findByStatus(JobPosting.JobStatus.ACTIVE, PageRequest.of(0, 200))
                .getContent();

        return activeJobs.stream()
                .map(job -> {
                    int score = computeScore(profile, job);
                    return JobRecommendationDTO.from(job, score, scoreLabel(score));
                })
                .sorted(Comparator.comparingInt(JobRecommendationDTO::getMatchScore).reversed())
                .collect(Collectors.toList());
    }
}
