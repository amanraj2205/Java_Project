package com.devstream.content.security;

import com.devstream.content.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("articleSecurity")
@RequiredArgsConstructor
public class ArticleSecurity {

    private final ArticleRepository articleRepository;

    public boolean isAuthor(String slug, String username) {
        if (slug == null || username == null) {
            return false;
        }
        return articleRepository.findBySlug(slug)
                .map(article -> username.equalsIgnoreCase(article.getAuthorUsername()))
                .orElse(false);
    }
}
