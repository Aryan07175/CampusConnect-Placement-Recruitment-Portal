package com.campusconnect.repository;

import com.campusconnect.entity.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<RecruiterProfile> findAllByApproved(boolean approved);
}
