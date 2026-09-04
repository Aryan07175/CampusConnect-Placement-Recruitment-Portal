package com.campusconnect.repository;

import com.campusconnect.entity.JobPosting;
import com.campusconnect.entity.JobPosting.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findByStatus(JobStatus status, Pageable pageable);
    Page<JobPosting> findByRecruiterId(Long recruiterId, Pageable pageable);

    @Query("SELECT j FROM JobPosting j WHERE j.status = 'ACTIVE' AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobPosting> searchActive(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT j FROM JobPosting j WHERE j.status = 'ACTIVE' AND " +
           "LOWER(j.jobType) = LOWER(:jobType)")
    Page<JobPosting> findActiveByJobType(@Param("jobType") String jobType, Pageable pageable);

    long countByStatus(JobStatus status);
}
