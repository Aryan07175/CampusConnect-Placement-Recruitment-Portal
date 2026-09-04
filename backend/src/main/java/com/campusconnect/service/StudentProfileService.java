package com.campusconnect.service;

import com.campusconnect.dto.StudentProfileRequest;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public StudentProfile upsertProfile(Long userId, StudentProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> StudentProfile.builder().user(user).build());

        if (req.getCollege() != null)        profile.setCollege(req.getCollege());
        if (req.getDegree() != null)         profile.setDegree(req.getDegree());
        if (req.getBranch() != null)         profile.setBranch(req.getBranch());
        if (req.getGraduationYear() != null) profile.setGraduationYear(req.getGraduationYear());
        if (req.getCgpa() != null)           profile.setCgpa(req.getCgpa());
        if (req.getSkills() != null)         profile.setSkills(req.getSkills());
        if (req.getBio() != null)            profile.setBio(req.getBio());
        if (req.getLinkedinUrl() != null)    profile.setLinkedinUrl(req.getLinkedinUrl());
        if (req.getGithubUrl() != null)      profile.setGithubUrl(req.getGithubUrl());
        if (req.getPortfolioUrl() != null)   profile.setPortfolioUrl(req.getPortfolioUrl());

        profile.setProfileComplete(isComplete(profile));
        return profileRepository.save(profile);
    }

    public StudentProfile getProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    @Transactional
    public StudentProfile uploadResume(Long userId, MultipartFile file) throws IOException {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        String uploadDir = "uploads/resumes";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        profile.setResumePath(filePath.toString());
        profile.setResumeOriginalName(file.getOriginalFilename());
        return profileRepository.save(profile);
    }

    private boolean isComplete(StudentProfile p) {
        return p.getCollege() != null && p.getDegree() != null
                && p.getBranch() != null && p.getSkills() != null
                && !p.getSkills().isBlank();
    }
}
