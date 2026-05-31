package com.qlda.aiservice.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlda.aiservice.dto.common.ApiSuccessResponse;
import com.qlda.aiservice.dto.request.ChatbotAskRequest;
import com.qlda.aiservice.dto.request.ChatbotFeedbackRequest;
import com.qlda.aiservice.entity.AiResultEntity;
import com.qlda.aiservice.repository.AiResultRepository;
import com.qlda.aiservice.service.chatbot.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final AiResultRepository aiResultRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/ask")
    public ResponseEntity<ApiSuccessResponse<Map<String, Object>>> ask(@Valid @RequestBody ChatbotAskRequest request) {
        return ResponseEntity.ok(ApiSuccessResponse.of("Chatbot response successfully", chatbotService.ask(request)));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiSuccessResponse<Map<String, Object>>> feedback(@Valid @RequestBody ChatbotFeedbackRequest request) {
        return aiResultRepository.findById(request.resultId())
            .map(entity -> {
                String updatedNote = appendFeedback(entity.getGhiChu(), request.feedback(), request.comment());
                entity.setGhiChu(updatedNote);
                aiResultRepository.save(entity);
                Map<String, Object> result = Map.of(
                    "resultId", request.resultId(),
                    "feedback", request.feedback(),
                    "recorded", true
                );
                return ResponseEntity.ok(ApiSuccessResponse.of("Feedback recorded", result));
            })
            .orElseGet(() -> {
                Map<String, Object> result = Map.of("resultId", request.resultId(), "recorded", false);
                return ResponseEntity.ok(ApiSuccessResponse.of("Result not found", result));
            });
    }

    @SuppressWarnings("unchecked")
    private String appendFeedback(String existingNote, String feedback, String comment) {
        Map<String, Object> noteMap = new LinkedHashMap<>();
        if (existingNote != null && !existingNote.isBlank()) {
            try {
                noteMap.putAll(objectMapper.readValue(existingNote, Map.class));
            } catch (Exception ignored) {}
        }
        noteMap.put("feedback", feedback);
        if (comment != null && !comment.isBlank()) noteMap.put("feedbackComment", comment);
        try {
            return objectMapper.writeValueAsString(noteMap);
        } catch (JsonProcessingException e) {
            return existingNote;
        }
    }
}
