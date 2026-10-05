package com.devstream.content.service;

import com.devstream.content.dto.ArticleCreateRequest;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.dto.ArticleUpdateRequest;
import com.devstream.content.model.Article;
import com.devstream.content.model.ArticleStatus;
import com.devstream.content.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public ArticleResponse createArticle(ArticleCreateRequest request, Long authorId, String authorUsername) {
        String slug = generateSlug(request.getTitle());

        String rawContent = request.getContentHtml() != null && !request.getContentHtml().isBlank()
                ? request.getContentHtml()
                : request.getContentMarkdown();

        int readTime = calculateReadTime(rawContent);

        Article article = Article.builder()
                .authorId(authorId)
                .authorUsername(authorUsername)
                .title(request.getTitle())
                .slug(slug)
                .contentHtml(request.getContentHtml())
                .contentJson(request.getContentJson())
                .contentMarkdown(request.getContentMarkdown())
                .summary(request.getSummary())
                .coverImageUrl(request.getCoverImageUrl())
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .status(request.getStatus() != null ? request.getStatus() : ArticleStatus.DRAFT)
                .readTimeMinutes(readTime)
                .viewCount(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Article savedArticle = articleRepository.save(article);
        return mapToResponse(savedArticle);
    }

    public ArticleResponse getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        // Increment view count
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);

        return mapToResponse(article);
    }

    public List<ArticleResponse> getAllPublishedArticles() {
        return articleRepository.findByStatus(ArticleStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getAllArticlesForModeration() {
        return articleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getArticlesByTag(String tag) {
        return articleRepository.findByTagsContaining(tag).stream()
                .filter(article -> article.getStatus() == ArticleStatus.PUBLISHED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getArticlesByAuthorUsername(String username) {
        return articleRepository.findByAuthorUsername(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getArticlesByAuthorUsernameAndStatus(String username, ArticleStatus status) {
        return articleRepository.findByAuthorUsernameAndStatus(username, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ArticleResponse updateArticle(String slug, ArticleUpdateRequest request, String currentUsername) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        if (!article.getAuthorUsername().equalsIgnoreCase(currentUsername)) {
            throw new RuntimeException("Unauthorized: You are not the author of this article!");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            article.setTitle(request.getTitle());
        }
        if (request.getContentHtml() != null) {
            article.setContentHtml(request.getContentHtml());
            article.setReadTimeMinutes(calculateReadTime(request.getContentHtml()));
        }
        if (request.getContentJson() != null) {
            article.setContentJson(request.getContentJson());
        }
        if (request.getContentMarkdown() != null) {
            article.setContentMarkdown(request.getContentMarkdown());
            if (article.getContentHtml() == null) {
                article.setReadTimeMinutes(calculateReadTime(request.getContentMarkdown()));
            }
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
        }
        if (request.getCoverImageUrl() != null) {
            article.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getTags() != null) {
            article.setTags(request.getTags());
        }
        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
        }
        article.setUpdatedAt(Instant.now());

        Article updatedArticle = articleRepository.save(article);
        return mapToResponse(updatedArticle);
    }

    public ArticleResponse setArticleVisibility(String slug, boolean hide) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        article.setStatus(hide ? ArticleStatus.HIDDEN : ArticleStatus.PUBLISHED);
        article.setUpdatedAt(Instant.now());
        Article updated = articleRepository.save(article);
        return mapToResponse(updated);
    }

    public void deleteArticle(String slug, String currentUsername) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        if (!article.getAuthorUsername().equalsIgnoreCase(currentUsername)) {
            throw new RuntimeException("Unauthorized: You can only delete your own articles!");
        }

        articleRepository.delete(article);
    }

    public void deleteArticleByModerator(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        articleRepository.delete(article);
    }

    private String generateSlug(String title) {
        String nowhitespace = WHITESPACE.matcher(title).replaceAll("-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");

        if (articleRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        return slug;
    }

    private int calculateReadTime(String content) {
        if (content == null || content.isBlank()) {
            return 1;
        }
        // Strip HTML tags if present
        String plainText = content.replaceAll("<[^>]*>", " ").trim();
        String[] words = plainText.split("\\s+");
        return Math.max(1, (int) Math.ceil(words.length / 200.0));
    }

    private ArticleResponse mapToResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .authorId(article.getAuthorId())
                .authorUsername(article.getAuthorUsername())
                .title(article.getTitle())
                .slug(article.getSlug())
                .contentHtml(article.getContentHtml())
                .contentJson(article.getContentJson())
                .contentMarkdown(article.getContentMarkdown())
                .summary(article.getSummary())
                .coverImageUrl(article.getCoverImageUrl())
                .tags(article.getTags())
                .status(article.getStatus())
                .readTimeMinutes(article.getReadTimeMinutes())
                .viewCount(article.getViewCount())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
