package com.devstream.aggregator.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePortfolioRequest {
    private String bio;
    private String githubUsername;
    private String avatarUrl;

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGithubUsername() { return githubUsername; }
    public void setGithubUsername(String githubUsername) { this.githubUsername = githubUsername; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
