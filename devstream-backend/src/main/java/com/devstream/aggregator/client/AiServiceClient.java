package com.devstream.aggregator.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final WebClient webClient;

    public AiServiceClient(@Value("${devstream.ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    public static class AiSummarizeRequest {
        private String content_markdown;
        private Integer max_length;

        public AiSummarizeRequest() {}

        public AiSummarizeRequest(String content_markdown, Integer max_length) {
            this.content_markdown = content_markdown;
            this.max_length = max_length;
        }

        public String getContent_markdown() { return content_markdown; }
        public void setContent_markdown(String content_markdown) { this.content_markdown = content_markdown; }
        public Integer getMax_length() { return max_length; }
        public void setMax_length(Integer max_length) { this.max_length = max_length; }
    }

    public static class AiSummarizeResponse {
        private String summary;

        public AiSummarizeResponse() {}

        public AiSummarizeResponse(String summary) {
            this.summary = summary;
        }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }

    public String generateSummary(String markdownText) {
        if (markdownText == null || markdownText.isBlank()) {
            return "No content available for AI bio summary generation.";
        }

        try {
            AiSummarizeRequest request = new AiSummarizeRequest(markdownText, 150);

            AiSummarizeResponse response = webClient.post()
                    .uri("/api/v1/ai/summarize")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AiSummarizeResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(ex -> {
                        log.warn("FastAPI AI microservice call failed: {}", ex.getMessage());
                        return Mono.just(new AiSummarizeResponse("AI summary currently unavailable."));
                    })
                    .block();

            return response != null && response.getSummary() != null 
                    ? response.getSummary() 
                    : "Developer profile active on DevStream.";
        } catch (Exception e) {
            log.error("Exception calling AI service: {}", e.getMessage());
            return "Developer profile active on DevStream.";
        }
    }
}
