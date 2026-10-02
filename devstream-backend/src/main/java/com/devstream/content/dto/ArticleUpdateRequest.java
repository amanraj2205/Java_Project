package com.devstream.content.dto;

import com.devstream.content.model.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleUpdateRequest {

    private String title;
    private String contentMarkdown;
    private String summary;
    private List<String> tags;
    private ArticleStatus status;
}
