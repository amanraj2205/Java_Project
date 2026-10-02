package com.devstream.content;

import com.devstream.content.dto.ArticleCreateRequest;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.model.Article;
import com.devstream.content.model.ArticleStatus;
import com.devstream.content.repository.ArticleRepository;
import com.devstream.content.service.ArticleService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @InjectMocks
    private ArticleService articleService;

    private ArticleCreateRequest createRequest;
    private Article mockArticle;

    @BeforeEach
    void setUp() {
        createRequest = ArticleCreateRequest.builder()
                .title("Building Microservices with Spring Boot 3")
                .contentMarkdown("# Spring Boot Microservices\nThis is a comprehensive guide to building microservices...")
                .summary("Executive summary of Spring Boot 3 microservices")
                .tags(List.of("java", "spring-boot", "microservices"))
                .status(ArticleStatus.PUBLISHED)
                .build();

        mockArticle = Article.builder()
                .id("65f1a2b3c4d5e6f7a8b9c0d1")
                .authorId(100L)
                .authorUsername("tech_lead")
                .title("Building Microservices with Spring Boot 3")
                .slug("building-microservices-with-spring-boot-3")
                .contentMarkdown("# Spring Boot Microservices\nThis is a comprehensive guide to building microservices...")
                .summary("Executive summary of Spring Boot 3 microservices")
                .tags(List.of("java", "spring-boot", "microservices"))
                .status(ArticleStatus.PUBLISHED)
                .readTimeMinutes(1)
                .viewCount(5L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should create article with auto-generated slug and read-time calculation")
    void testCreateArticle() {
        when(articleRepository.existsBySlug("building-microservices-with-spring-boot-3")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(mockArticle);

        ArticleResponse response = articleService.createArticle(createRequest, 100L, "tech_lead");

        assertNotNull(response);
        assertEquals("building-microservices-with-spring-boot-3", response.getSlug());
        assertEquals("tech_lead", response.getAuthorUsername());
        assertEquals(ArticleStatus.PUBLISHED, response.getStatus());

        verify(articleRepository, times(1)).save(any(Article.class));
    }

    @Test
    @DisplayName("Should fetch article by slug and increment view count")
    void testGetArticleBySlug() {
        when(articleRepository.findBySlug("building-microservices-with-spring-boot-3")).thenReturn(Optional.of(mockArticle));
        when(articleRepository.save(any(Article.class))).thenReturn(mockArticle);

        ArticleResponse response = articleService.getArticleBySlug("building-microservices-with-spring-boot-3");

        assertNotNull(response);
        assertEquals("building-microservices-with-spring-boot-3", response.getSlug());
        assertEquals(6L, mockArticle.getViewCount());

        verify(articleRepository, times(1)).save(mockArticle);
    }
}
