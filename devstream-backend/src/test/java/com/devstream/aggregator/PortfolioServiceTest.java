package com.devstream.aggregator;

import com.devstream.aggregator.client.AiServiceClient;
import com.devstream.aggregator.client.GitHubApiClient;
import com.devstream.aggregator.dto.DeveloperPortfolioResponse;
import com.devstream.aggregator.dto.GitHubRepoDto;
import com.devstream.aggregator.service.PortfolioService;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.model.ArticleStatus;
import com.devstream.content.service.ArticleService;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ArticleService articleService;

    @Mock
    private GitHubApiClient gitHubApiClient;

    @Mock
    private AiServiceClient aiServiceClient;

    @InjectMocks
    private PortfolioService portfolioService;

    private User testUser;
    private ArticleResponse articleResponse;
    private GitHubRepoDto repoDto;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("amanraj")
                .email("aman@devstream.io")
                .bio("Senior Full Stack Architect")
                .githubUsername("amanraj2205")
                .build();

        articleResponse = ArticleResponse.builder()
                .id("65f1a2b3c4d5e6f7a8b9c0d1")
                .authorId(1L)
                .authorUsername("amanraj")
                .title("Architecting Monorepo Systems")
                .slug("architecting-monorepo-systems")
                .contentMarkdown("# Monorepo Architecture Guide")
                .status(ArticleStatus.PUBLISHED)
                .viewCount(150L)
                .createdAt(Instant.now())
                .build();

        repoDto = GitHubRepoDto.builder()
                .name("Java_Project")
                .htmlUrl("https://github.com/amanraj2205/Java_Project")
                .description("DevStream Platform")
                .stargazersCount(25)
                .forksCount(5)
                .language("Java")
                .build();
    }

    @Test
    @DisplayName("Should aggregate user info, articles, GitHub repos, and AI summary into complete portfolio")
    void testGetDeveloperPortfolio() {
        when(userRepository.findByUsername("amanraj")).thenReturn(Optional.of(testUser));
        when(articleService.getArticlesByAuthorUsername("amanraj")).thenReturn(List.of(articleResponse));
        when(gitHubApiClient.fetchPublicRepositories("amanraj2205")).thenReturn(List.of(repoDto));
        when(aiServiceClient.generateSummary(anyString())).thenReturn("Aman is a Senior Full Stack Architect skilled in Java & React.");

        DeveloperPortfolioResponse response = portfolioService.getDeveloperPortfolio("amanraj");

        assertNotNull(response);
        assertEquals("amanraj", response.getUsername());
        assertEquals("aman@devstream.io", response.getEmail());
        assertEquals(1, response.getTotalArticles());
        assertEquals(150L, response.getTotalArticleViews());
        assertEquals(25, response.getTotalGitHubStars());
        assertEquals("Aman is a Senior Full Stack Architect skilled in Java & React.", response.getAiGeneratedBioSummary());
        assertEquals(1, response.getGithubRepositories().size());
        assertEquals("Java_Project", response.getGithubRepositories().get(0).getName());
    }
}
