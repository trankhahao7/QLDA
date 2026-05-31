package com.qlda.aiservice.service.chatbot;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

/**
 * Phát hiện intent từ câu hỏi người dùng dựa trên keyword matching.
 * Hỗ trợ cả tiếng Việt có dấu và không dấu (tự động normalize).
 */
@Component
public class ChatbotIntentDetector {

    private static final List<String[]> STATISTIC_RULES = List.of(
        // Upload count
        new String[]{"MY_UPLOADED_DOCUMENT_COUNT",
            "upload", "tai len", "toi da tai", "bao nhieu van ban toi upload",
            "bao nhieu van ban toi da tai"},
        // Due soon
        new String[]{"MY_DUE_SOON_DOCUMENT_COUNT",
            "sap het han", "sap den han", "sap qua han", "sap den deadline"},
        // Overdue
        new String[]{"MY_OVERDUE_DOCUMENT_COUNT",
            "qua han", "tre han", "da qua han", "het han roi"},
        // Total users
        new String[]{"TOTAL_USER_COUNT",
            "bao nhieu nguoi dung", "tong nguoi dung", "so nguoi dung he thong",
            "he thong co bao nhieu nguoi"},
        // Total documents
        new String[]{"TOTAL_DOCUMENT_COUNT",
            "tong van ban he thong", "he thong co bao nhieu van ban",
            "bao nhieu tai lieu he thong", "tong tai lieu"}
    );

    private static final List<String> USER_GUIDE_KEYWORDS = List.of(
        // Có dấu
        "hướng dẫn", "cách nào", "làm sao", "làm thế nào", "thực hiện như thế nào",
        "cách để", "cách thực hiện", "bước nào", "quy trình",
        // Không dấu
        "huong dan", "cach nao", "lam sao", "lam the nao", "thuc hien nhu the nao",
        "cach de", "cach thuc hien", "buoc nao", "quy trinh",
        // Specific actions
        "dang nhap", "dang xuat", "tai van ban", "upload", "tiep nhan",
        "chuyen xu ly", "phe duyet", "ky so", "phat hanh", "tim kiem",
        "tao van ban", "tao moi", "chinh sua", "xoa", "chia se"
    );

    private static final List<String> DOCUMENT_SEARCH_KEYWORDS = List.of(
        // Có dấu
        "tìm kiếm", "tìm tài liệu", "tìm văn bản", "tra cứu",
        "tài liệu liên quan", "văn bản về", "văn bản nào",
        "có tài liệu nào", "cho tôi xem", "tìm cho tôi",
        // Không dấu
        "tim kiem", "tim tai lieu", "tim van ban", "tra cuu",
        "tai lieu lien quan", "van ban ve", "van ban nao",
        "co tai lieu nao", "cho toi xem", "tim cho toi"
    );

    public IntentDetectionResult detect(String question) {
        String normalized = normalize(question);
        String original = question == null ? "" : question.toLowerCase(Locale.ROOT).trim();

        // Ưu tiên detect statistic trước (requires metric code)
        IntentDetectionResult statisticResult = detectStatistic(normalized, original);
        if (statisticResult != null) return statisticResult;

        // Detect user guide
        if (matchesAny(normalized, USER_GUIDE_KEYWORDS) || matchesAny(original, USER_GUIDE_KEYWORDS)) {
            return new IntentDetectionResult(ChatbotIntent.USER_GUIDE, null);
        }

        // Detect document search
        if (matchesAny(normalized, DOCUMENT_SEARCH_KEYWORDS) || matchesAny(original, DOCUMENT_SEARCH_KEYWORDS)) {
            return new IntentDetectionResult(ChatbotIntent.DOCUMENT_SEARCH, null);
        }

        return new IntentDetectionResult(ChatbotIntent.GENERAL_HELP, null);
    }

    private IntentDetectionResult detectStatistic(String normalized, String original) {
        for (String[] rule : STATISTIC_RULES) {
            String metricCode = rule[0];
            for (int i = 1; i < rule.length; i++) {
                String keyword = rule[i];
                if (normalized.contains(keyword) || original.contains(keyword)) {
                    ChatbotMetricCode code = ChatbotMetricCode.valueOf(metricCode);
                    return new IntentDetectionResult(ChatbotIntent.SYSTEM_STATISTIC, code);
                }
            }
        }
        return null;
    }

    private boolean matchesAny(String text, List<String> keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private String normalize(String input) {
        if (input == null) return "";
        String lowered = input.toLowerCase(Locale.ROOT).trim();
        String nfd = Normalizer.normalize(lowered, Normalizer.Form.NFD);
        return nfd
            .replaceAll("\\p{M}+", "")
            .replaceAll("[^a-z0-9\\s]", " ")
            .replaceAll("\\s+", " ")
            .trim();
    }
}
