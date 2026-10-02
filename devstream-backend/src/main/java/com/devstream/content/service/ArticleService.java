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

        int readTime = calculateReadTime(request.getContentMarkdown());

        Article article = Article.builder()
                .authorId(authorId)
                .authorUsername(authorUsername)
                .title(request.getTitle())
                .slug(slug)
                .contentMarkdown(request.getContentMarkdown())
                .summary(request.getSummary())
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

    public ArticleResponse updateArticle(String slug, ArticleUpdateRequest request, String currentUsername) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        if (!article.getAuthorUsername().equals(currentUsername)) {
            throw new RuntimeException("Unauthorized: You are not the author of this article!");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            article.setTitle(request.getTitle());
        }
        if (request.getContentMarkdown() != null) {
            article.setContentMarkdown(request.getContentMarkdown());
            article.setReadTimeMinutes(calculateReadTime(request.getContentMarkdown()));
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
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

    public void deleteArticle(String slug, String currentUsername) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));

        if (!article.getAuthorUsername().equals(currentUsername)) {
            throw new RuntimeException("Unauthorized: You can only delete your own articles!");
        }

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

    private int calculateReadTime(String contentMarkdown) {
        if (contentMarkdown == null || contentMarkdown.isBlank()) {
            return 1;
        }
        String[] words = contentMarkdown.trim().split("\\s+");
        return Math.max(1, (int) Math.ceil(words.length / 200.0));
    }

    private ArticleResponse mapToResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .authorId(article.getAuthorId())
                .authorUsername(article.getAuthorUsername())
                .title(article.getTitle())
                .slug(article.getSlug())
                .contentMarkdown(article.getContentMarkdown())
                .summary(article.getSummary())
                .tags(article.getTags())
                .status(article.getStatus())
                .readTimeMinutes(article.getReadTimeMinutes())
                .viewCount(article.getViewCount())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
