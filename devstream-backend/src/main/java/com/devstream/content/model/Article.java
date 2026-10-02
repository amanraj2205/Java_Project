package com.devstream.content.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    private String id;

    private Long authorId;

    private String authorUsername;

    private String title;

    @Indexed(unique = true)
    private String slug;

    private String contentMarkdown;

    private String summary;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    private Integer readTimeMinutes;

    @Builder.Default
    private Long viewCount = 0L;

    private Instant createdAt;

    private Instant updatedAt;
}
