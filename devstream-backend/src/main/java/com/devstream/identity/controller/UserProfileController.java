package com.devstream.identity.controller;

import com.devstream.identity.model.User;
import com.devstream.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/resumes/";

    /**
     * Upload PDF Resume for User Profile
     */
    @PostMapping("/resume")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded resume file is empty."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF resume files are accepted."));
        }

        String username = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Ensure upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file locally with unique UUID prefix
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String resumeUrl = "/uploads/resumes/" + fileName;
        user.setResumeUrl(resumeUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Resume uploaded successfully!",
            "resumeUrl", resumeUrl
        ));
    }
}
