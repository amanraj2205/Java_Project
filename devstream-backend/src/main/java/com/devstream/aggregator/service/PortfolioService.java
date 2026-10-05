package com.devstream.aggregator.service;

import com.devstream.aggregator.client.AiServiceClient;
import com.devstream.aggregator.client.GitHubApiClient;
import com.devstream.aggregator.dto.DeveloperPortfolioResponse;
import com.devstream.aggregator.dto.GitHubRepoDto;
import com.devstream.aggregator.dto.UpdatePortfolioRequest;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.service.ArticleService;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final ArticleService articleService;
    private final GitHubApiClient gitHubApiClient;
    private final AiServiceClient aiServiceClient;

    public DeveloperPortfolioResponse getDeveloperPortfolio(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User profile not found with username: " + username));

        List<ArticleResponse> articles = articleService.getArticlesByAuthorUsername(username);

        String githubHandle = user.getGithubUsername() != null && !user.getGithubUsername().isBlank() 
                ? user.getGithubUsername() 
                : user.getUsername();

        List<GitHubRepoDto> githubRepos = gitHubApiClient.fetchPublicRepositories(githubHandle);

        long totalViews = articles.stream()
                .mapToLong(ArticleResponse::getViewCount)
                .sum();

        int totalStars = githubRepos.stream()
                .mapToInt(repo -> repo.getStargazersCount() != null ? repo.getStargazersCount() : 0)
                .sum();

        String articleContentForAi = articles.stream()
                .map(ArticleResponse::getContentMarkdown)
                .limit(3)
                .collect(Collectors.joining("\n\n"));

        String aiBio = aiServiceClient.generateSummary(
                "Bio: " + (user.getBio() != null ? user.getBio() : "Technical developer") + 
                "\n\nArticles:\n" + articleContentForAi
        );

        return DeveloperPortfolioResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .githubUsername(user.getGithubUsername())
                .avatarUrl(user.getAvatarUrl())
                .totalArticles(articles.size())
                .totalArticleViews(totalViews)
                .totalGitHubStars(totalStars)
                .aiGeneratedBioSummary(aiBio)
                .articles(articles)
                .githubRepositories(githubRepos)
                .build();
    }

    @Transactional
    public DeveloperPortfolioResponse updatePortfolio(String username, UpdatePortfolioRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User profile not found with username: " + username));

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getGithubUsername() != null) {
            user.setGithubUsername(request.getGithubUsername());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        return getDeveloperPortfolio(username);
    }
}
