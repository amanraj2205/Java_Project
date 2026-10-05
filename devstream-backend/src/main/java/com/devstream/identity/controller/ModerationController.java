package com.devstream.identity.controller;

import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.service.ArticleService;
import com.devstream.identity.dto.UserResponse;
import com.devstream.identity.model.Role;
import com.devstream.identity.model.RoleName;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.RoleRepository;
import com.devstream.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/moderation")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MODERATOR')")
public class ModerationController {

    private final ArticleService articleService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    /**
     * Moderation Queue: Retrieve all articles regardless of status (DRAFT, PUBLISHED, HIDDEN).
     */
    @GetMapping("/articles")
    public ResponseEntity<List<ArticleResponse>> getModerationArticles() {
        return ResponseEntity.ok(articleService.getAllArticlesForModeration());
    }

    /**
     * Moderation Action: Hide or restore an article.
     */
    @PatchMapping("/articles/{slug}/visibility")
    public ResponseEntity<ArticleResponse> setArticleVisibility(@PathVariable String slug,
                                                                @RequestParam boolean hide) {
        return ResponseEntity.ok(articleService.setArticleVisibility(slug, hide));
    }

    /**
     * Moderation Action: Permanently delete any article.
     */
    @DeleteMapping("/articles/{slug}")
    public ResponseEntity<Void> deleteArticle(@PathVariable String slug) {
        articleService.deleteArticleByModerator(slug);
        return ResponseEntity.noContent().build();
    }

    /**
     * User Oversight: View all registered users and their current roles.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .bio(user.getBio())
                        .githubUsername(user.getGithubUsername())
                        .avatarUrl(user.getAvatarUrl())
                        .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * User Oversight: Assign a new role to a user (e.g. promote to ROLE_MODERATOR or assign ROLE_STUDENT_AUTHOR).
     */
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long userId,
                                                       @RequestParam RoleName roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Role targetRole = roleRepository.findByName(roleName.name())
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName.name()).build()));

        Set<Role> roles = user.getRoles();
        roles.clear();
        roles.add(targetRole);
        user.setRoles(roles);

        User saved = userRepository.save(user);

        return ResponseEntity.ok(UserResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .bio(saved.getBio())
                .githubUsername(saved.getGithubUsername())
                .avatarUrl(saved.getAvatarUrl())
                .roles(saved.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(saved.getCreatedAt())
                .build());
    }
}
