package com.campusconnect.service;

import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MVP skill-matching engine.
 *
 * Score = (# of required skills present in student's skill list) / (# required skills) × 100
 * Returns 0 if the job has no required skills.
 * Case-insensitive comparison.
 */
@Service
public class SkillMatchService {

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
}
