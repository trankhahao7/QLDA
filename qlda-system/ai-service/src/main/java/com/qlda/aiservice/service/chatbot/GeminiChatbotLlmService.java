package com.qlda.aiservice.service.chatbot;

import com.qlda.aiservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiChatbotLlmService implements ChatbotLlmService {

    private static final String MODEL = "gemini-2.5-flash";
    private static final double DEFAULT_CONFIDENCE = 0.95;

    private final GeminiService geminiService;

    @Override
    public ChatbotLlmResponse generateAnswer(String systemPrompt, String userPrompt, String question) {
        String answer = geminiService.chatWithSystem(systemPrompt, userPrompt);
        return new ChatbotLlmResponse(answer, DEFAULT_CONFIDENCE, MODEL);
    }
}
