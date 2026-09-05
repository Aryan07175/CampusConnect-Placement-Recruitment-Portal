package com.campusconnect.repository;

import com.campusconnect.entity.Application;
import com.campusconnect.entity.Application.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByStudentIdAndJobId(Long studentId, Long jobId);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
    Page<Application> findByStudentId(Long studentId, Pageable pageable);
    Page<Application> findByJobId(Long jobId, Pageable pageable);
    List<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status);
    long countByJobId(Long jobId);
    long countByStatus(ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = 'PLACED'")
    long countPlaced();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = 'OFFERED'")
    long countOffered();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = 'SHORTLISTED'")
    long countShortlisted();

    @Query("SELECT AVG(a.skillMatchScore) FROM Application a WHERE a.skillMatchScore > 0")
    Double avgSkillMatchScore();

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a WHERE a.status IN ('OFFERED','PLACED')")
    long countUniqueStudentsOfferedOrPlaced();
}
