package com.campusconnect.service;

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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Compute skill match score
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
