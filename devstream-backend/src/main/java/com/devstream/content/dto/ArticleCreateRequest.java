package com.devstream.content.dto;

import com.devstream.content.model.ArticleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Markdown content is required")
    private String contentMarkdown;

    private String summary;

    private List<String> tags;

    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;
}
