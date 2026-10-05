package com.devstream.content.controller;

import com.devstream.content.dto.ArticleCreateRequest;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.dto.ArticleUpdateRequest;
import com.devstream.content.model.ArticleStatus;
import com.devstream.content.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Create article: Accessible to any authenticated user (ROLE_STUDENT_AUTHOR, ROLE_MODERATOR, etc.).
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ArticleResponse> createArticle(@Valid @RequestBody ArticleCreateRequest request,
                                                         Authentication authentication) {
        String currentUsername = authentication.getName();
        ArticleResponse response = articleService.createArticle(request, 1L, currentUsername);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Public feeds & reading: Accessible to all roles including ROLE_GUEST and unauthenticated users.
     */
    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getAllPublishedArticles() {
        return ResponseEntity.ok(articleService.getAllPublishedArticles());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ArticleResponse> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getArticleBySlug(slug));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ArticleResponse>> getArticlesByTag(@PathVariable String tag) {
        return ResponseEntity.ok(articleService.getArticlesByTag(tag));
    }

    @GetMapping("/author/{username}")
    public ResponseEntity<List<ArticleResponse>> getArticlesByAuthor(@PathVariable String username) {
        return ResponseEntity.ok(articleService.getArticlesByAuthorUsername(username));
    }

    /**
     * Drafts manager: Author can view their own drafts for the Student Dashboard.
     */
    @GetMapping("/my-drafts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ArticleResponse>> getMyDrafts(Authentication authentication) {
        return ResponseEntity.ok(articleService.getArticlesByAuthorUsernameAndStatus(
                authentication.getName(), ArticleStatus.DRAFT
        ));
    }

    /**
     * Update article: Only the author can update their own article.
     */
    @PutMapping("/{slug}")
    @PreAuthorize("isAuthenticated() and @articleSecurity.isAuthor(#slug, authentication.name)")
    public ResponseEntity<ArticleResponse> updateArticle(@PathVariable String slug,
                                                         @RequestBody ArticleUpdateRequest request,
                                                         Authentication authentication) {
        String currentUsername = authentication.getName();
        return ResponseEntity.ok(articleService.updateArticle(slug, request, currentUsername));
    }

    /**
     * Delete article: ROLE_MODERATOR can delete any article; authors can delete their own.
     */
    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('MODERATOR') or (isAuthenticated() and @articleSecurity.isAuthor(#slug, authentication.name))")
    public ResponseEntity<Void> deleteArticle(@PathVariable String slug,
                                              Authentication authentication) {
        boolean isMod = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR"));

        if (isMod) {
            articleService.deleteArticleByModerator(slug);
        } else {
            articleService.deleteArticle(slug, authentication.getName());
        }
        return ResponseEntity.noContent().build();
    }
}
