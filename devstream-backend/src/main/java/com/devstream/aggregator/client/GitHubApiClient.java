package com.devstream.aggregator.client;

import com.devstream.aggregator.dto.GitHubRepoDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Component
public class GitHubApiClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubApiClient.class);

    private final WebClient webClient;

    public GitHubApiClient(@Value("${devstream.github.api.base-url:https://api.github.com}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .defaultHeader("User-Agent", "DevStream-Backend-App")
                .build();
    }

    public List<GitHubRepoDto> fetchPublicRepositories(String githubUsername) {
        if (githubUsername == null || githubUsername.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return webClient.get()
                    .uri("/users/{username}/repos?sort=updated&per_page=10", githubUsername)
                    .retrieve()
                    .bodyToFlux(GitHubRepoDto.class)
                    .collectList()
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(ex -> {
                        log.warn("Failed to fetch GitHub repos for user {}: {}", githubUsername, ex.getMessage());
                        return Mono.just(Collections.emptyList());
                    })
                    .block();
        } catch (Exception e) {
            log.error("Error communicating with GitHub REST API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
