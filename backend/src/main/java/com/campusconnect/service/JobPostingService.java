package com.campusconnect.service;

import com.campusconnect.dto.JobPostingRequest;
import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.JobPostingRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "jobs", key = "(#keyword ?: '') + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<JobPosting> getActiveJobs(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return jobPostingRepository.searchActive(keyword.trim(), pageable);
        }
        return jobPostingRepository.findByStatus(JobPosting.JobStatus.ACTIVE, pageable);
    }

    public JobPosting getById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));
    }

    public Page<JobPosting> getByRecruiter(Long recruiterId, Pageable pageable) {
        return jobPostingRepository.findByRecruiterId(recruiterId, pageable);
    }

    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobPosting create(Long recruiterId, JobPostingRequest req) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        JobPosting job = JobPosting.builder()
                .recruiter(recruiter)
                .title(req.getTitle())
                .companyName(req.getCompanyName())
                .description(req.getDescription())
                .responsibilities(req.getResponsibilities())
                .requirements(req.getRequirements())
                .requiredSkills(req.getRequiredSkills())
                .jobType(req.getJobType())
                .location(req.getLocation())
                .remote(req.getRemote())
                .salaryRange(req.getSalaryRange())
                .applicationDeadline(req.getApplicationDeadline())
                .experienceLevel(req.getExperienceLevel())
                .status(req.getStatus() != null ? req.getStatus() : JobPosting.JobStatus.ACTIVE)
                .build();

        return jobPostingRepository.save(job);
    }

    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobPosting update(Long recruiterId, Long jobId, JobPostingRequest req) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to edit this job posting.");
        }

        if (req.getTitle() != null)               job.setTitle(req.getTitle());
        if (req.getCompanyName() != null)         job.setCompanyName(req.getCompanyName());
        if (req.getDescription() != null)         job.setDescription(req.getDescription());
        if (req.getResponsibilities() != null)    job.setResponsibilities(req.getResponsibilities());
        if (req.getRequirements() != null)        job.setRequirements(req.getRequirements());
        if (req.getRequiredSkills() != null)      job.setRequiredSkills(req.getRequiredSkills());
        if (req.getJobType() != null)             job.setJobType(req.getJobType());
        if (req.getLocation() != null)            job.setLocation(req.getLocation());
        if (req.getRemote() != null)              job.setRemote(req.getRemote());
        if (req.getSalaryRange() != null)         job.setSalaryRange(req.getSalaryRange());
        if (req.getApplicationDeadline() != null) job.setApplicationDeadline(req.getApplicationDeadline());
        if (req.getExperienceLevel() != null)     job.setExperienceLevel(req.getExperienceLevel());
        if (req.getStatus() != null)              job.setStatus(req.getStatus());

        return jobPostingRepository.save(job);
    }

    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobPosting updateStatus(Long recruiterId, Long jobId, JobPosting.JobStatus status) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to update this job posting.");
        }
        job.setStatus(status);
        return jobPostingRepository.save(job);
    }

    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public void delete(Long recruiterId, Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to delete this job posting.");
        }
        jobPostingRepository.delete(job);
    }
}
