package com.campusconnect.config;

import com.campusconnect.entity.ERole;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.RoleRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Seeds the roles table and a default admin user on first startup.
 * Safe to run on subsequent restarts — uses findByName / existsByEmail guards.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
    }

    private void seedRoles() {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(Role.builder().name(eRole).build());
                log.info("Seeded role: {}", eRole);
            }
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@campusconnect.com")) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            User admin = User.builder()
                    .username("admin")
                    .email("admin@campusconnect.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .firstName("Campus")
                    .lastName("Admin")
                    .enabled(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: admin@campusconnect.com / Admin@123");
        }
    }
}
