package com.campusconnect.repository;

import com.campusconnect.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    /** All interviews for a single application (chronological) */
    List<Interview> findByApplicationIdOrderByScheduledAt(Long applicationId);

    /** All interviews for a student — used for "Upcoming Interviews" widget on student dashboard */
    @Query("""
        SELECT i FROM Interview i
        WHERE i.application.student.id = :studentUserId
        AND   i.status = 'SCHEDULED'
        AND   i.scheduledAt >= :now
        ORDER BY i.scheduledAt ASC
        """)
    List<Interview> findUpcomingByStudent(Long studentUserId, LocalDateTime now);

    /** All interviews owned by jobs posted by a recruiter */
    @Query("""
        SELECT i FROM Interview i
        WHERE i.application.job.recruiter.id = :recruiterId
        ORDER BY i.scheduledAt ASC
        """)
    List<Interview> findByRecruiter(Long recruiterId);

    long countByApplicationId(Long applicationId);
}
