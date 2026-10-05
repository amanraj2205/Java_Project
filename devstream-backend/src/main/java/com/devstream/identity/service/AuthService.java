package com.devstream.identity.service;

import com.devstream.identity.dto.AuthResponse;
import com.devstream.identity.dto.LoginRequest;
import com.devstream.identity.dto.RegisterRequest;
import com.devstream.identity.model.Role;
import com.devstream.identity.model.RoleName;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.RoleRepository;
import com.devstream.identity.repository.UserRepository;
import com.devstream.identity.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already in use!");
        }

        // Assign specified role (e.g., ROLE_MODERATOR) or default to ROLE_STUDENT_AUTHOR
        String targetRoleName = RoleName.ROLE_STUDENT_AUTHOR.name();
        if (request.getRole() != null && !request.getRole().isBlank()) {
            if (request.getRole().toUpperCase().contains("MODERATOR")) {
                targetRoleName = RoleName.ROLE_MODERATOR.name();
            } else {
                targetRoleName = request.getRole().startsWith("ROLE_") ? request.getRole() : "ROLE_" + request.getRole();
            }
        }

        final String roleNameToFind = targetRoleName;
        Role assignedRole = roleRepository.findByName(roleNameToFind)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleNameToFind).build()));

        Set<Role> roles = new HashSet<>();
        roles.add(assignedRole);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio())
                .githubUsername(request.getGithubUsername())
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        Set<String> roleNames = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        String token = tokenProvider.generateTokenForUsername(savedUser.getUsername(), roleNames);

        return AuthResponse.builder()
                .accessToken(token)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .githubUsername(savedUser.getGithubUsername())
                .roles(roleNames)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .githubUsername(user.getGithubUsername())
                .roles(roleNames)
                .build();
    }
}
