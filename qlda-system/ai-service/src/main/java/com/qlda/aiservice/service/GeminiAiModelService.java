package com.qlda.aiservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class GeminiAiModelService implements AiModelService {

    private static final String MODEL = "gemini-2.5-flash";
    private static final double DEFAULT_CONFIDENCE = 0.88;

    private static final String JSON_SYSTEM = """
        Bạn là AI chuyên phân tích văn bản hành chính tiếng Việt.
        Luôn trả lời bằng JSON hợp lệ theo đúng schema được yêu cầu.
        Không thêm markdown, không giải thích bên ngoài JSON.
        """;

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Override
    public SummarizationOutput summarize(String text, String summaryType, String language) {
        String instruction = buildSummarizeInstruction(summaryType, language);
        String prompt = instruction + "\n\n" + text;
        String result = geminiService.chat(prompt);
        return new SummarizationOutput(result, DEFAULT_CONFIDENCE, MODEL);
    }

    @Override
    @SuppressWarnings("unchecked")
    public ClassificationOutput classify(String text, List<String> categories, String language) {
        String categoriesStr = String.join(", ", categories);
        String prompt = """
            Phân loại văn bản sau vào đúng một danh mục trong danh sách: [%s]

            Văn bản:
            %s

            Trả lời JSON theo schema:
            {"category": "<mã_danh_mục>", "categoryName": "<tên_hiển_thị>", "reason": "<lý_do_ngắn>", "confidence": <số_từ_0.0_đến_1.0>}
            """.formatted(categoriesStr, text);

        String result = geminiService.chatJson(JSON_SYSTEM, prompt);
        return parseClassification(result, categories);
    }

    @Override
    @SuppressWarnings("unchecked")
    public MetadataOutput extractMetadata(String text, List<String> fields, String language) {
        String fieldsStr = String.join(", ", fields);
        String prompt = """
            Trích xuất các trường thông tin sau từ văn bản hành chính (nếu không có thì để null):
            Trường cần trích xuất: [%s]

            Văn bản:
            %s

            Trả lời JSON theo schema (key là tên trường, value là giá trị tìm được hoặc null):
            {}
            """.formatted(fieldsStr, text);

        String result = geminiService.chatJson(JSON_SYSTEM, prompt);
        return parseMetadata(result, fields);
    }

    @Override
    @SuppressWarnings("unchecked")
    public SuggestionHandlingOutput suggestHandling(String text, Map<String, Object> context) {
        String contextStr = context != null && !context.isEmpty() ? context.toString() : "Không có";
        String prompt = """
            Đề xuất hướng xử lý cho văn bản hành chính sau:

            Văn bản:
            %s

            Ngữ cảnh xử lý: %s

            Trả lời JSON theo schema:
            {"suggestions": [{"action": "<mã_hành_động>", "description": "<mô_tả_ngắn>", "priority": "<HIGH|MEDIUM|LOW>"}], "confidence": <số_từ_0.0_đến_1.0>}
            """.formatted(text, contextStr);

        String result = geminiService.chatJson(JSON_SYSTEM, prompt);
        return parseSuggestionHandling(result);
    }

    @Override
    public SuggestionReplyOutput suggestReply(String text, String replyStyle, String language) {
        String styleDesc = resolveReplyStyleDesc(replyStyle);
        String prompt = """
            Soạn thảo văn bản trả lời cho nội dung sau với văn phong %s.
            Ngôn ngữ: %s.

            Văn bản gốc cần trả lời:
            %s

            Yêu cầu:
            - Văn phong phải đúng loại được yêu cầu
            - Nội dung phải phù hợp với văn bản gốc
            - Không thêm thông tin không có trong văn bản gốc
            - Trả lời hoàn chỉnh, sẵn sàng gửi đi
            """.formatted(styleDesc, language, text);

        String result = geminiService.chat(prompt);
        return new SuggestionReplyOutput(result, replyStyle, DEFAULT_CONFIDENCE, MODEL);
    }

    @Override
    public ChatbotOutput answerWithContext(String question, String context) {
        String prompt = """
            Dữ liệu tìm được từ hệ thống:
            %s

            Câu hỏi của người dùng:
            %s

            Hãy trả lời dựa trên dữ liệu trên, bằng tiếng Việt, ngắn gọn, rõ ràng.
            Nếu dữ liệu không liên quan, trả lời: "Không tìm thấy tài liệu phù hợp."
            """.formatted(context, question);

        String result = geminiService.chat(prompt);
        return new ChatbotOutput(result, DEFAULT_CONFIDENCE, MODEL);
    }

    private String buildSummarizeInstruction(String summaryType, String language) {
        return switch (summaryType.toUpperCase()) {
            case "SHORT" -> "Tóm tắt văn bản sau trong 2-3 câu ngắn gọn bằng tiếng " + language + ":";
            case "BULLET" -> "Tóm tắt các điểm chính của văn bản sau dạng gạch đầu dòng (dùng dấu -), mỗi điểm một dòng, bằng tiếng " + language + ":";
            case "DETAILED" -> "Tóm tắt chi tiết văn bản sau, giữ nguyên các thông tin quan trọng, bằng tiếng " + language + ":";
            default -> "Tóm tắt văn bản sau bằng tiếng " + language + ":";
        };
    }

    private String resolveReplyStyleDesc(String replyStyle) {
        if (replyStyle == null) return "trung tính, chuyên nghiệp";
        return switch (replyStyle.toUpperCase()) {
            case "FORMAL" -> "trang trọng, công thức, dùng kính ngữ";
            case "FRIENDLY" -> "thân thiện, gần gũi, dễ tiếp cận";
            case "CONCISE" -> "ngắn gọn, súc tích, đi thẳng vào vấn đề";
            default -> "trung tính, chuyên nghiệp";
        };
    }

    @SuppressWarnings("unchecked")
    private ClassificationOutput parseClassification(String json, List<String> categories) {
        try {
            Map<String, Object> map = objectMapper.readValue(cleanJson(json), Map.class);
            String category = String.valueOf(map.getOrDefault("category", categories.getFirst()));
            String categoryName = String.valueOf(map.getOrDefault("categoryName", category));
            String reason = String.valueOf(map.getOrDefault("reason", ""));
            double confidence = toDouble(map.getOrDefault("confidence", DEFAULT_CONFIDENCE));
            return new ClassificationOutput(category, categoryName, confidence, reason, MODEL);
        } catch (Exception e) {
            log.warn("Failed to parse classification JSON, using fallback. raw={}", safePreview(json));
            return new ClassificationOutput(categories.getFirst(), categories.getFirst(), 0.5, json, MODEL);
        }
    }

    @SuppressWarnings("unchecked")
    private MetadataOutput parseMetadata(String json, List<String> fields) {
        try {
            Map<String, Object> metadata = objectMapper.readValue(cleanJson(json), Map.class);
            return new MetadataOutput(metadata, DEFAULT_CONFIDENCE, MODEL);
        } catch (Exception e) {
            log.warn("Failed to parse metadata JSON, returning empty. raw={}", safePreview(json));
            Map<String, Object> empty = new LinkedHashMap<>();
            fields.forEach(f -> empty.put(f, null));
            return new MetadataOutput(empty, 0.0, MODEL);
        }
    }

    @SuppressWarnings("unchecked")
    private SuggestionHandlingOutput parseSuggestionHandling(String json) {
        try {
            Map<String, Object> map = objectMapper.readValue(cleanJson(json), Map.class);
            List<Map<String, Object>> raw = (List<Map<String, Object>>) map.getOrDefault("suggestions", List.of());
            List<SuggestionItem> suggestions = raw.stream()
                .map(s -> new SuggestionItem(
                    String.valueOf(s.getOrDefault("action", "CHUYEN_XU_LY")),
                    String.valueOf(s.getOrDefault("description", "")),
                    String.valueOf(s.getOrDefault("priority", "MEDIUM"))
                ))
                .toList();
            double confidence = toDouble(map.getOrDefault("confidence", DEFAULT_CONFIDENCE));
            return new SuggestionHandlingOutput(suggestions, confidence, MODEL);
        } catch (Exception e) {
            log.warn("Failed to parse suggestion handling JSON, using fallback. raw={}", safePreview(json));
            return new SuggestionHandlingOutput(
                List.of(new SuggestionItem("CHUYEN_XU_LY", "Xử lý theo quy trình nội bộ", "HIGH")),
                0.5, MODEL
            );
        }
    }

    private String cleanJson(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
        return text.trim();
    }

    private double toDouble(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(value)); }
        catch (Exception e) { return DEFAULT_CONFIDENCE; }
    }

    private String safePreview(String text) {
        if (text == null) return "null";
        return text.length() > 200 ? text.substring(0, 200) + "..." : text;
    }
}
