package com.qlda.aiservice.service.chatbot;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ChatbotResultMapper {

    public Map<String, Object> toResponse(
        Long resultId,
        ChatbotIntent intent,
        ChatbotMetricCode metricCode,
        String question,
        String answer,
        Long value,
        List<Map<String, Object>> sources,
        String modelUsed,
        double confidence,
        String responseType,
        Map<String, Object> structuredData
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("resultId", resultId);
        response.put("intent", intent.name());
        if (metricCode != null) {
            response.put("metricCode", metricCode.name());
        }
        response.put("question", question);
        response.put("answer", answer);
        if (value != null) {
            response.put("value", value);
        }
        if (sources != null && !sources.isEmpty()) {
            response.put("sources", sources);
        }
        response.put("modelUsed", modelUsed);
        response.put("confidence", confidence);
        response.put("responseType", responseType != null ? responseType : "TEXT");
        if (structuredData != null && !structuredData.isEmpty()) {
            response.put("structuredData", structuredData);
        }
        return response;
    }

    // Legacy overload for backward compat
    public Map<String, Object> toResponse(
        Long resultId,
        ChatbotIntent intent,
        ChatbotMetricCode metricCode,
        String question,
        String answer,
        Long value,
        List<Map<String, Object>> sources,
        String modelUsed,
        double confidence
    ) {
        return toResponse(resultId, intent, metricCode, question, answer,
            value, sources, modelUsed, confidence, "TEXT", null);
    }

    public Map<String, Object> buildDocumentStructuredData(List<Map<String, Object>> sources) {
        List<Map<String, Object>> docs = new ArrayList<>();
        for (Map<String, Object> source : sources) {
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("documentId", source.get("documentId"));
            Object title = source.get("title");
            if (title != null) doc.put("title", title);
            Object soKyHieu = source.get("soKyHieu");
            if (soKyHieu != null) doc.put("soKyHieu", soKyHieu);
            docs.add(doc);
        }
        // De-duplicate by documentId
        List<Map<String, Object>> unique = docs.stream()
            .filter(d -> d.get("documentId") != null)
            .collect(java.util.stream.Collectors.collectingAndThen(
                java.util.stream.Collectors.toMap(
                    d -> d.get("documentId"),
                    d -> d,
                    (a, b) -> a,
                    java.util.LinkedHashMap::new
                ),
                m -> new ArrayList<>(m.values())
            ));
        return Map.of("documents", unique);
    }

    public Map<String, Object> buildStatCardStructuredData(
            ChatbotMetricCode metricCode, long value, String label) {
        return Map.of(
            "metricCode", metricCode.name(),
            "metricLabel", label,
            "value", value
        );
    }

    public Map<String, Object> buildGuideStepsStructuredData(String answer) {
        List<String> steps = new ArrayList<>();
        for (String line : answer.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.matches("^(Bước|Step|\\d+[\\.\\)]).*")) {
                steps.add(trimmed);
            }
        }
        if (steps.isEmpty()) return Map.of();
        return Map.of("steps", steps);
    }
}
