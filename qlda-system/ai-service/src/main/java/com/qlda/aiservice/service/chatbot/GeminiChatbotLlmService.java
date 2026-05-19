package com.qlda.aiservice.service.chatbot;

import com.qlda.aiservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiChatbotLlmService implements ChatbotLlmService {

    private final GeminiService geminiService;

    @Override
    public ChatbotLlmResponse generateAnswer(String systemPrompt, String userPrompt, String question) {
        String answer = geminiService.chat(userPrompt);
        return new ChatbotLlmResponse(answer, 0.95, "gemini-2.5-flash");
    }
}
