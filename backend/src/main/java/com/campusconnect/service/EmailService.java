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
}
