package com.devstream.aggregator.dto;

import com.devstream.content.dto.ArticleResponse;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeveloperPortfolioResponse {

    private Long id;
    private String username;
    private String email;
    private String bio;
    private String githubUsername;
    private String avatarUrl;

    private Integer totalArticles;
    private Long totalArticleViews;
    private Integer totalGitHubStars;

    private String aiGeneratedBioSummary;

    private List<ArticleResponse> articles;
    private List<GitHubRepoDto> githubRepositories;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGithubUsername() { return githubUsername; }
    public void setGithubUsername(String githubUsername) { this.githubUsername = githubUsername; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Integer getTotalArticles() { return totalArticles; }
    public void setTotalArticles(Integer totalArticles) { this.totalArticles = totalArticles; }

    public Long getTotalArticleViews() { return totalArticleViews; }
    public void setTotalArticleViews(Long totalArticleViews) { this.totalArticleViews = totalArticleViews; }

    public Integer getTotalGitHubStars() { return totalGitHubStars; }
    public void setTotalGitHubStars(Integer totalGitHubStars) { this.totalGitHubStars = totalGitHubStars; }

    public String getAiGeneratedBioSummary() { return aiGeneratedBioSummary; }
    public void setAiGeneratedBioSummary(String aiGeneratedBioSummary) { this.aiGeneratedBioSummary = aiGeneratedBioSummary; }

    public List<ArticleResponse> getArticles() { return articles; }
    public void setArticles(List<ArticleResponse> articles) { this.articles = articles; }

    public List<GitHubRepoDto> getGithubRepositories() { return githubRepositories; }
    public void setGithubRepositories(List<GitHubRepoDto> githubRepositories) { this.githubRepositories = githubRepositories; }
}
