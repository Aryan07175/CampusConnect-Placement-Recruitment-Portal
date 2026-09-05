package com.campusconnect.service;

import com.campusconnect.dto.ApplicationDetailsDTO;
import com.campusconnect.entity.Application;
import com.campusconnect.entity.Application.ApplicationStatus;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.ApplicationRepository;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SkillMatchService skillMatchService;

    @Transactional
    public Application apply(Long studentUserId, Long jobId, String coverLetter) {
        if (applicationRepository.existsByStudentIdAndJobId(studentUserId, jobId)) {
            throw new BadRequestException("You have already applied for this job.");
        }

        User student = userRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentUserId));
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", jobId));

        if (job.getStatus() != JobPosting.JobStatus.ACTIVE) {
            throw new BadRequestException("This job posting is no longer accepting applications.");
        }

        int score = 0;
        StudentProfile profile = studentProfileRepository.findByUserId(studentUserId).orElse(null);
        if (profile != null) {
            score = skillMatchService.computeScore(profile, job);
        }

        Application application = Application.builder()
                .student(student)
                .job(job)
                .coverLetter(coverLetter)
                .skillMatchScore(score)
                .status(ApplicationStatus.APPLIED)
                .build();

        return applicationRepository.save(application);
    }

    public Page<Application> getStudentApplications(Long studentUserId, Pageable pageable) {
        return applicationRepository.findByStudentId(studentUserId, pageable);
    }

    public Page<Application> getJobApplications(Long jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable);
    }

    /**
     * Phase 3: Rich applicant view for recruiters — includes full StudentProfile
     * data in each entry so no second request is needed.
     */
    public Page<ApplicationDetailsDTO> getJobApplicationsWithDetails(Long jobId, Pageable pageable) {
        Page<Application> apps = applicationRepository.findByJobId(jobId, pageable);
        List<ApplicationDetailsDTO> dtos = apps.getContent().stream()
                .map(this::toDetailsDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, apps.getTotalElements());
    }

    private ApplicationDetailsDTO toDetailsDTO(Application app) {
        User student = app.getStudent();
        StudentProfile profile = studentProfileRepository.findByUserId(student.getId()).orElse(null);

        List<String> skills = List.of();
        if (profile != null && profile.getSkills() != null && !profile.getSkills().isBlank()) {
            skills = Arrays.stream(profile.getSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        boolean profileComplete = profile != null
                && profile.getCollege() != null
                && profile.getDegree() != null
                && profile.getSkills() != null
                && profile.getResumePath() != null;

        return ApplicationDetailsDTO.builder()
                .applicationId(app.getId())
                .status(app.getStatus())
                .skillMatchScore(app.getSkillMatchScore())
                .coverLetter(app.getCoverLetter())
                .recruiterNotes(app.getRecruiterNotes())
                .appliedAt(app.getAppliedAt())
                .studentId(student.getId())
                .studentFirstName(student.getFirstName())
                .studentLastName(student.getLastName())
                .studentEmail(student.getEmail())
                .studentUsername(student.getUsername())
                .college(profile != null ? profile.getCollege() : null)
                .degree(profile != null ? profile.getDegree() : null)
                .branch(profile != null ? profile.getBranch() : null)
                .graduationYear(profile != null ? profile.getGraduationYear() : null)
                .cgpa(profile != null ? profile.getCgpa() : null)
                .skills(skills)
                .bio(profile != null ? profile.getBio() : null)
                .linkedinUrl(profile != null ? profile.getLinkedinUrl() : null)
                .githubUrl(profile != null ? profile.getGithubUrl() : null)
                .portfolioUrl(profile != null ? profile.getPortfolioUrl() : null)
                .hasResume(profile != null && profile.getResumePath() != null)
                .resumeOriginalName(profile != null ? profile.getResumeOriginalName() : null)
                .profileComplete(profileComplete)
                .build();
    }

    @Transactional
    public Application updateStatus(Long applicationId, ApplicationStatus status, String notes) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));
        app.setStatus(status);
        if (notes != null) app.setRecruiterNotes(notes);
        return applicationRepository.save(app);
    }

    public Application getById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
    }
}
