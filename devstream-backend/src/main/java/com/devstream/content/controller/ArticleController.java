package com.devstream.content.controller;

import com.devstream.content.dto.ArticleCreateRequest;
import com.devstream.content.dto.ArticleResponse;
import com.devstream.content.dto.ArticleUpdateRequest;
import com.devstream.content.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @PostMapping
    public ResponseEntity<ArticleResponse> createArticle(@Valid @RequestBody ArticleCreateRequest request,
                                                         Authentication authentication) {
        String currentUsername = authentication.getName();
        // Default author ID set to 1L for initial demo, expandable via SecurityContext principal details
        ArticleResponse response = articleService.createArticle(request, 1L, currentUsername);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

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

    @PutMapping("/{slug}")
    public ResponseEntity<ArticleResponse> updateArticle(@PathVariable String slug,
                                                         @RequestBody ArticleUpdateRequest request,
                                                         Authentication authentication) {
        String currentUsername = authentication.getName();
        return ResponseEntity.ok(articleService.updateArticle(slug, request, currentUsername));
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteArticle(@PathVariable String slug,
                                             Authentication authentication) {
        String currentUsername = authentication.getName();
        articleService.deleteArticle(slug, currentUsername);
        return ResponseEntity.noContent().build();
    }
}
