package com.qlda.aiservice.service;

import com.qlda.aiservice.config.GeminiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class GeminiEmbeddingService implements EmbeddingService {

    private static final String EMBEDDING_MODEL = "text-embedding-004";
    private static final int MAX_INPUT_CHARS = 8000;

    private final RestTemplate restTemplate;
    private final GeminiConfig geminiConfig;

    @Override
    @SuppressWarnings("unchecked")
    public List<Double> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        String truncated = text.length() > MAX_INPUT_CHARS
            ? text.substring(0, MAX_INPUT_CHARS)
            : text;

        String url = geminiConfig.buildEmbeddingUrl(EMBEDDING_MODEL);

        Map<String, Object> requestBody = Map.of(
            "model", "models/" + EMBEDDING_MODEL,
            "content", Map.of(
                "parts", List.of(Map.of("text", truncated))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("x-goog-api-key", geminiConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<?, ?> body = response.getBody();
            if (body == null) {
                log.warn("Gemini embedding returned null body");
                return List.of();
            }

            Map<?, ?> embeddingObj = (Map<?, ?>) body.get("embedding");
            if (embeddingObj == null) {
                log.warn("Gemini embedding response missing 'embedding' field");
                return List.of();
            }

            List<?> values = (List<?>) embeddingObj.get("values");
            if (values == null || values.isEmpty()) {
                log.warn("Gemini embedding response has empty 'values'");
                return List.of();
            }

            List<Double> result = values.stream()
                .map(v -> ((Number) v).doubleValue())
                .toList();

            log.debug("Generated embedding dim={} textLength={}", result.size(), text.length());
            return result;

        } catch (Exception e) {
            log.error("Failed to generate embedding textLength={}", text.length(), e);
            return List.of();
        }
    }
}
