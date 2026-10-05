package com.devstream.content.repository;

import com.devstream.content.model.Article;
import com.devstream.content.model.ArticleStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends MongoRepository<Article, String> {
    Optional<Article> findBySlug(String slug);
    List<Article> findByAuthorId(Long authorId);
    List<Article> findByAuthorUsername(String authorUsername);
    List<Article> findByAuthorUsernameAndStatus(String authorUsername, ArticleStatus status);
    List<Article> findByTagsContaining(String tag);
    List<Article> findByStatus(ArticleStatus status);
    List<Article> findByAuthorIdAndStatus(Long authorId, ArticleStatus status);
    Boolean existsBySlug(String slug);
}
