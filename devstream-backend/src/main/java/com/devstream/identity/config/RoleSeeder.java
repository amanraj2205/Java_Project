package com.devstream.identity.config;

import com.devstream.identity.model.Role;
import com.devstream.identity.model.RoleName;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.RoleRepository;
import com.devstream.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        seedDefaultModerator();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName.name()).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName.name()).build());
                log.info("Initialized role: {}", roleName.name());
            }
        }
    }

    private void seedDefaultModerator() {
        if (!userRepository.existsByUsername("moderator")) {
            Role moderatorRole = roleRepository.findByName(RoleName.ROLE_MODERATOR.name())
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_MODERATOR.name()).build()));

            Set<Role> roles = new HashSet<>();
            roles.add(moderatorRole);

            User moderator = User.builder()
                    .username("moderator")
                    .email("moderator@devstream.io")
                    .password(passwordEncoder.encode("password123"))
                    .bio("DevStream Platform Moderator & Content Administrator")
                    .githubUsername("devstream-mod")
                    .roles(roles)
                    .build();

            userRepository.save(moderator);
            log.info("Default moderator account created (username: moderator, password: password123)");
        }
    }
}
