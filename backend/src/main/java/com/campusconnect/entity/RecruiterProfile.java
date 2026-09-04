package com.campusconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recruiter_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 150, nullable = false)
    private String companyName;

    @Column(length = 100)
    private String companyWebsite;

    @Column(length = 100)
    private String industry;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    @Column(length = 255)
    private String companyLogoPath;

    @Column(length = 20)
    private String companySize;     // e.g. "1-50", "51-200", "201-500", "500+"

    @Column(length = 100)
    private String headquarters;

    @Column(nullable = false)
    @Builder.Default
    private boolean approved = false;  // Admin must approve recruiter

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
