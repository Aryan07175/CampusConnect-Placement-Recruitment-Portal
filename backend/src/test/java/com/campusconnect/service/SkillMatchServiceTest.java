package com.campusconnect.service;

import com.campusconnect.dto.JobRecommendationDTO;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillMatchServiceTest {

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private SkillMatchService skillMatchService;

    private StudentProfile studentProfile;
    private JobPosting jobPosting;

    @BeforeEach
    void setUp() {
        studentProfile = StudentProfile.builder()
                .skills("Java, Spring Boot, React, MySQL")
                .build();

        jobPosting = JobPosting.builder()
                .id(1L)
                .title("Software Engineer")
                .requiredSkills("Java, React, SQL")
                .build();
    }

    @Test
    void computeScore_WithMatchingSkills() {
        int score = skillMatchService.computeScore(studentProfile, jobPosting);
        // Student has Java, Spring Boot, React, MySQL
        // Job requires Java, React, SQL
        // Java matches, React matches. SQL does not match MySQL exactly (since we use exact matching).
        // 2 out of 3 = 66% (rounded from 66.6) or 67%. 
        // 2 / 3 * 100 = 66.666... Math.round gives 67
        assertEquals(67, score);
    }

    @Test
    void computeScore_WithNoRequiredSkills() {
        jobPosting.setRequiredSkills("");
        int score = skillMatchService.computeScore(studentProfile, jobPosting);
        assertEquals(0, score);
    }

    @Test
    void computeScore_WithNoStudentSkills() {
        studentProfile.setSkills("");
        int score = skillMatchService.computeScore(studentProfile, jobPosting);
        assertEquals(0, score);
    }

    @Test
    void computeScore_ExactMatchAvoidsFalsePositives() {
        studentProfile.setSkills("React");
        jobPosting.setRequiredSkills("C");
        // React contains C, but exact match shouldn't match it
        int score = skillMatchService.computeScore(studentProfile, jobPosting);
        assertEquals(0, score);
    }

    @Test
    void getRecommendationsForStudent_Success() {
        Long studentId = 1L;
        JobPosting job2 = JobPosting.builder()
                .id(2L)
                .title("Backend Developer")
                .requiredSkills("Java, Spring Boot")
                .build();

        when(studentProfileRepository.findByUserId(studentId)).thenReturn(Optional.of(studentProfile));
        when(jobPostingRepository.findByStatus(eq(JobPosting.JobStatus.ACTIVE), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(Arrays.asList(jobPosting, job2)));

        List<JobRecommendationDTO> recommendations = skillMatchService.getRecommendationsForStudent(studentId);

        assertEquals(2, recommendations.size());
        
        // job2 should have score 100 (Java, Spring Boot both match)
        // jobPosting should have score 67
        assertEquals(2L, recommendations.get(0).getJobId());
        assertEquals(100, recommendations.get(0).getMatchScore());
        assertEquals("Excellent Match", recommendations.get(0).getMatchLabel());

        assertEquals(1L, recommendations.get(1).getJobId());
        assertEquals(67, recommendations.get(1).getMatchScore());
        assertEquals("Good Match", recommendations.get(1).getMatchLabel());
    }

    @Test
    void getRecommendationsForStudent_ProfileNotFound() {
        Long studentId = 999L;
        when(studentProfileRepository.findByUserId(studentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            skillMatchService.getRecommendationsForStudent(studentId);
        });
    }
}
