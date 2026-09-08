package com.campusconnect.service;

import com.campusconnect.dto.RecruiterProfileRequest;
import com.campusconnect.entity.RecruiterProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.RecruiterProfileRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public RecruiterProfile upsertProfile(Long userId, RecruiterProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        RecruiterProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> RecruiterProfile.builder().user(user).build());

        if (req.getCompanyName() != null)        profile.setCompanyName(req.getCompanyName());
        if (req.getCompanyWebsite() != null)     profile.setCompanyWebsite(req.getCompanyWebsite());
        if (req.getIndustry() != null)           profile.setIndustry(req.getIndustry());
        if (req.getCompanyDescription() != null) profile.setCompanyDescription(req.getCompanyDescription());
        if (req.getCompanySize() != null)        profile.setCompanySize(req.getCompanySize());
        if (req.getHeadquarters() != null)       profile.setHeadquarters(req.getHeadquarters());

        return profileRepository.save(profile);
    }

    public RecruiterProfile getProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("RecruiterProfile", "userId", userId));
    }

    public List<RecruiterProfile> getPendingApprovals() {
        return profileRepository.findAllByApproved(false);
    }

    @Transactional
    public RecruiterProfile approve(Long profileId) {
        RecruiterProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("RecruiterProfile", "id", profileId));
        profile.setApproved(true);
        RecruiterProfile savedProfile = profileRepository.save(profile);

        try {
            emailService.sendRecruiterApprovalEmail(
                    savedProfile.getUser().getEmail(),
                    savedProfile.getUser().getFirstName(),
                    savedProfile.getCompanyName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send recruiter approval email: " + e.getMessage());
        }

        return savedProfile;
    }
}
