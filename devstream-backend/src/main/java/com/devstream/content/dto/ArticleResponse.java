package com.devstream.content.dto;

import com.devstream.content.model.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleResponse {

    private String id;
    private Long authorId;
    private String authorUsername;
    private String title;
    private String slug;
    private String contentMarkdown;
    private String summary;
    private List<String> tags;
    private ArticleStatus status;
    private Integer readTimeMinutes;
    private Long viewCount;
    private Instant createdAt;
    private Instant updatedAt;
}
