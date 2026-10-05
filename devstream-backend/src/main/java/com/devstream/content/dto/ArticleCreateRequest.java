package com.devstream.content.dto;

import com.devstream.content.model.ArticleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    private String contentHtml;
    private String contentJson;
    private String contentMarkdown;

    private String summary;
    private String coverImageUrl;

    private List<String> tags;

    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }

    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }

    public String getContentMarkdown() { return contentMarkdown; }
    public void setContentMarkdown(String contentMarkdown) { this.contentMarkdown = contentMarkdown; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public ArticleStatus getStatus() { return status; }
    public void setStatus(ArticleStatus status) { this.status = status; }
}
