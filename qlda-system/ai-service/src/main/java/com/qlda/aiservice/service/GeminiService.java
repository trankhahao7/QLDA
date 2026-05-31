package com.qlda.aiservice.service;

import com.qlda.aiservice.config.GeminiConfig;
import com.qlda.aiservice.exception.GeminiRateLimitException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestTemplate restTemplate;
    private final GeminiConfig geminiConfig;
    private Semaphore requestSemaphore;

    @Value("${gemini.api.max-concurrent-requests:1}")
    private int maxConcurrentRequests;

    @Value("${gemini.api.max-wait-for-permit-ms:2000}")
    private long maxWaitForPermitMs;

    @Value("${gemini.api.max-retries:2}")
    private int maxRetries;

    @Value("${gemini.api.initial-backoff-ms:1000}")
    private long initialBackoffMs;

    @Value("${gemini.api.max-backoff-ms:5000}")
    private long maxBackoffMs;

    private static final String DEFAULT_SYSTEM_CONTEXT = """
        Bạn là trợ lý AI của hệ thống Quản lý Văn bản (QLDA).
        Nhiệm vụ của bạn là hỗ trợ người dùng sử dụng hệ thống như:
        đăng nhập, tải văn bản, tiếp nhận văn bản, xử lý công việc,
        phê duyệt, tìm kiếm, theo dõi tiến độ, sử dụng AI và các chức năng Office 365.
        Luôn trả lời bằng tiếng Việt, rõ ràng, đúng trọng tâm.
        Không bịa chức năng ngoài dữ liệu được cung cấp.
        """;

    private static final Map<String, Object> DEFAULT_GEN_CONFIG = Map.of(
        "maxOutputTokens", 1024,
        "temperature", 0.2,
        "topP", 0.9,
        "topK", 40
    );

    private static final Map<String, Object> JSON_GEN_CONFIG = Map.of(
        "maxOutputTokens", 1024,
        "temperature", 0.1,
        "topP", 0.9,
        "topK", 40,
        "responseMimeType", "application/json"
    );

    @PostConstruct
    void init() {
        requestSemaphore = new Semaphore(Math.max(1, maxConcurrentRequests), true);
    }

    public String chat(String userMessage) {
        return executeRequest(DEFAULT_SYSTEM_CONTEXT, userMessage, DEFAULT_GEN_CONFIG);
    }

    public String chatWithSystem(String systemInstruction, String userMessage) {
        String resolvedSystem = (systemInstruction == null || systemInstruction.isBlank())
            ? DEFAULT_SYSTEM_CONTEXT
            : systemInstruction;
        return executeRequest(resolvedSystem, userMessage, DEFAULT_GEN_CONFIG);
    }

    public String chatJson(String systemInstruction, String userMessage) {
        String resolvedSystem = (systemInstruction == null || systemInstruction.isBlank())
            ? DEFAULT_SYSTEM_CONTEXT
            : systemInstruction;
        return executeRequest(resolvedSystem, userMessage, JSON_GEN_CONFIG);
    }

    public String chat(String userMessage, String context) {
        String finalPrompt = """
            Dữ liệu hệ thống tìm được:
            %s

            Câu hỏi người dùng:
            %s

            Yêu cầu trả lời:
            - Chỉ dùng dữ liệu hệ thống phía trên.
            - Nếu dữ liệu trống hoặc không liên quan, trả lời: "Không tìm thấy tài liệu phù hợp."
            - Không tự bịa thêm tài liệu.
            - Trả lời ngắn gọn bằng tiếng Việt.
            """.formatted(context, userMessage);
        return chat(finalPrompt);
    }

    public String chatUserGuide(String userMessage, String context) {
        String finalPrompt = """
            Bạn là chatbot hướng dẫn sử dụng hệ thống QLDA.

            Dữ liệu hướng dẫn:
            %s

            Câu hỏi người dùng:
            %s

            Nhiệm vụ:
            Hãy hướng dẫn người dùng thực hiện thao tác được hỏi dựa trên dữ liệu hướng dẫn.

            Cách trả lời bắt buộc:
            Để thực hiện thao tác này, bạn làm như sau:

            1. Viết bước 1 thành một câu hoàn chỉnh.
            2. Viết bước 2 thành một câu hoàn chỉnh.
            3. Viết bước 3 thành một câu hoàn chỉnh.
            4. Viết bước 4 thành một câu hoàn chỉnh.
            5. Viết bước 5 thành một câu hoàn chỉnh nếu dữ liệu có đủ thông tin.

            Quy tắc:
            - Chỉ dùng dữ liệu hướng dẫn phía trên.
            - Không được chỉ trả lời một câu mở đầu.
            - Không được trả lời cụt.
            - Không được bịa chức năng ngoài dữ liệu.
            - Nếu dữ liệu không liên quan, trả lời đúng câu: "Không tìm thấy hướng dẫn phù hợp trong hệ thống."
            - Trả lời bằng tiếng Việt.
            """.formatted(context, userMessage);
        return chat(finalPrompt);
    }

    private String executeRequest(String systemInstruction, String userMessage, Map<String, Object> genConfig) {
        String requestId = UUID.randomUUID().toString();
        String url = geminiConfig.buildApiUrl();
        long startedAt = System.nanoTime();

        if (!acquirePermit(requestId)) {
            throw new GeminiRateLimitException(
                "Hệ thống đang xử lý quá nhiều yêu cầu AI cùng lúc. Vui lòng thử lại sau.",
                maxWaitForPermitMs
            );
        }

        try {
            Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstruction))
                ),
                "contents", List.of(
                    Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userMessage))
                    )
                ),
                "generationConfig", genConfig
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set("x-goog-api-key", geminiConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            long delayMs = initialBackoffMs;

            for (int attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    log.debug(
                        "Gemini request start requestId={} attempt={} promptLength={}",
                        requestId, attempt + 1, userMessage != null ? userMessage.length() : 0
                    );

                    ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

                    long durationMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
                    log.debug(
                        "Gemini request success requestId={} status={} durationMs={}",
                        requestId, response.getStatusCode(), durationMs
                    );

                    String text = extractText(response.getBody(), requestId);
                    return (text == null || text.isBlank())
                        ? "Xin lỗi, tôi không thể xử lý yêu cầu này lúc này."
                        : text;

                } catch (HttpClientErrorException.TooManyRequests e) {
                    long retryAfterMs = resolveRetryAfterMs(e, delayMs);
                    String errorBody = e.getResponseBodyAsString();
                    boolean isQuotaExceeded = errorBody != null
                        && (errorBody.contains("Quota exceeded for metric") || errorBody.contains("limit: 0"));

                    log.warn(
                        "Gemini 429 requestId={} attempt={}/{} quotaExceeded={} retryAfterMs={}",
                        requestId, attempt + 1, maxRetries + 1, isQuotaExceeded, retryAfterMs
                    );

                    if (isQuotaExceeded || attempt >= maxRetries) {
                        throw new GeminiRateLimitException(
                            "Gemini đang giới hạn request, vui lòng thử lại sau.",
                            retryAfterMs, e
                        );
                    }

                    sleepWithJitter(Math.min(delayMs, maxBackoffMs));
                    delayMs = Math.min(delayMs * 2, maxBackoffMs);

                } catch (HttpClientErrorException e) {
                    log.error(
                        "Gemini client error requestId={} status={} body={}",
                        requestId, e.getStatusCode(), safeBody(e.getResponseBodyAsString()), e
                    );
                    throw e;
                }
            }

            throw new RuntimeException("Max retries exceeded");

        } finally {
            requestSemaphore.release();
            long durationMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
            log.debug("Gemini request finished requestId={} durationMs={}", requestId, durationMs);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> body, String requestId) {
        try {
            if (body == null) throw new IllegalStateException("Empty response body");

            var candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                log.warn("Gemini missing candidates requestId={}", requestId);
                throw new IllegalStateException("Missing candidates");
            }

            var candidate = candidates.get(0);
            log.info("Gemini finishReason requestId={} finishReason={}", requestId, candidate.get("finishReason"));

            var content = (Map<String, Object>) candidate.get("content");
            if (content == null) {
                log.warn("Gemini missing content requestId={}", requestId);
                throw new IllegalStateException("Missing content");
            }

            var parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                log.warn("Gemini missing parts requestId={}", requestId);
                throw new IllegalStateException("Missing parts");
            }

            StringBuilder result = new StringBuilder();
            for (Map<String, Object> part : parts) {
                Object text = part.get("text");
                if (text != null) result.append(text);
            }

            String finalText = result.toString().trim();
            log.info("Gemini extracted text requestId={} length={}", requestId, finalText.length());
            return finalText;

        } catch (Exception e) {
            log.error("Parse Gemini response error requestId={}", requestId, e);
            return "Xin lỗi, tôi không thể xử lý yêu cầu này lúc này.";
        }
    }

    private boolean acquirePermit(String requestId) {
        try {
            boolean acquired = requestSemaphore.tryAcquire(maxWaitForPermitMs, TimeUnit.MILLISECONDS);
            if (!acquired) {
                log.warn("Gemini queue full requestId={} waitMs={}", requestId, maxWaitForPermitMs);
            }
            return acquired;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private long resolveRetryAfterMs(HttpClientErrorException.TooManyRequests e, long fallbackMs) {
        try {
            String retryAfter = e.getResponseHeaders() != null
                ? e.getResponseHeaders().getFirst(HttpHeaders.RETRY_AFTER)
                : null;
            if (retryAfter == null || retryAfter.isBlank()) return fallbackMs;
            return TimeUnit.SECONDS.toMillis(Long.parseLong(retryAfter.trim()));
        } catch (Exception ignored) {
            return fallbackMs;
        }
    }

    private void sleepWithJitter(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private String safeBody(String body) {
        if (body == null) return null;
        return body.length() > 500 ? body.substring(0, 500) + "..." : body;
    }
}
