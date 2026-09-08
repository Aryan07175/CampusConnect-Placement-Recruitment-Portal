package com.campusconnect.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    /**
     * MOCK email service.
     * In a production environment with valid SMTP credentials in application.properties,
     * this would use org.springframework.mail.javamail.JavaMailSender.
     */
    public void sendApplicationStatusUpdateEmail(String toEmail, String studentName, String companyName, String newStatus) {
        String subject = "Update on your application at " + companyName;
        String body = String.format("Hi %s,\n\nYour application for %s has been updated to: %s.\n\nBest,\nCampusConnect Team",
                studentName, companyName, newStatus);
        
        log.info("========== MOCK EMAIL SENT ==========");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("=====================================");
    }

    public void sendRecruiterApprovalEmail(String toEmail, String recruiterName, String companyName) {
        String subject = "Your Recruiter Account has been Approved!";
        String body = String.format("Hi %s,\n\nGood news! Your recruiter profile for %s has been approved by the Admin.\nYou can now start posting jobs on CampusConnect.\n\nBest,\nCampusConnect Team",
                recruiterName, companyName);
        
        log.info("========== MOCK EMAIL SENT ==========");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("=====================================");
    }
}
