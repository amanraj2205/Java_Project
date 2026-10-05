package com.devstream.identity.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String githubUsername;
    private String avatarUrl;
    private Set<String> roles;
    private LocalDateTime createdAt;
}
