package com.qlda.aiservice.service.chatbot;

import com.qlda.aiservice.service.GeminiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
public class ChatbotIntentDetector {

    private final GeminiService geminiService;

    public ChatbotIntentDetector(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    private static final List<String[]> STATISTIC_RULES = List.of(
        new String[]{"MY_UPLOADED_DOCUMENT_COUNT",
            "upload", "tai len", "toi da tai", "bao nhieu van ban toi upload",
            "bao nhieu van ban toi da tai", "toi da dang bao nhieu"},
        new String[]{"MY_PENDING_DOCUMENT_COUNT",
            "cho xu ly", "dang cho", "chua xu ly", "van ban cho toi",
            "toi can xu ly", "bao nhieu viec", "viec chua lam",
            "chờ xử lý", "đang chờ", "chưa xử lý", "việc chưa làm"},
        new String[]{"MY_COMPLETED_DOCUMENT_COUNT",
            "da xu ly xong", "hoan thanh roi", "da hoan thanh", "xu ly xong",
            "đã xử lý xong", "hoàn thành rồi", "đã hoàn thành"},
        new String[]{"MY_DUE_SOON_DOCUMENT_COUNT",
            "sap het han", "sap den han", "sap qua han", "sap den deadline",
            "sắp hết hạn", "sắp đến hạn", "sắp quá hạn"},
        new String[]{"MY_OVERDUE_DOCUMENT_COUNT",
            "qua han cua toi", "tre han cua toi", "van ban toi qua han",
            "quá hạn của tôi", "trễ hạn của tôi"},
        new String[]{"TOTAL_USER_COUNT",
            "bao nhieu nguoi dung", "tong nguoi dung", "so nguoi dung he thong",
            "he thong co bao nhieu nguoi", "bao nhiêu người dùng", "tổng người dùng"},
        new String[]{"TOTAL_DOCUMENT_COUNT",
            "tong van ban he thong", "he thong co bao nhieu van ban",
            "bao nhieu tai lieu he thong", "tong tai lieu", "tong van ban",
            "tổng văn bản", "hệ thống có bao nhiêu"},
        new String[]{"TOTAL_INCOMING_DOCUMENT_COUNT",
            "van ban den", "tong van ban den", "bao nhieu van ban den",
            "văn bản đến", "tổng văn bản đến"},
        new String[]{"SLA_VIOLATION_COUNT",
            "vi pham sla", "vi pham han xu ly", "bao nhieu vi pham",
            "vi phạm SLA", "vi phạm hạn", "quá hạn sla"},
        new String[]{"DOCUMENT_THIS_MONTH_COUNT",
            "thang nay", "trong thang", "thang hien tai", "bao nhieu van ban thang",
            "tháng này", "trong tháng", "tháng hiện tại"}
    );

    private static final List<String> USER_GUIDE_KEYWORDS = List.of(
        "hướng dẫn", "cách nào", "làm sao", "làm thế nào", "thực hiện như thế nào",
        "cách để", "cách thực hiện", "bước nào", "làm như thế nào", "chỉ tôi cách",
        "hỗ trợ tôi", "giúp tôi", "tôi muốn biết cách",
        "huong dan", "cach nao", "lam sao", "lam the nao", "thuc hien nhu the nao",
        "cach de", "cach thuc hien", "buoc nao", "lam nhu the nao", "chi toi cach",
        "ho tro toi", "giup toi",
        // Specific system actions
        "đăng nhập", "đăng xuất", "đăng ký", "tải văn bản", "nộp văn bản",
        "upload", "tiếp nhận", "chuyển xử lý", "phê duyệt", "ký số", "phát hành",
        "tạo văn bản", "tạo mới", "chỉnh sửa", "xóa", "chia sẻ", "in ấn",
        "dang nhap", "dang xuat", "tai van ban", "nop van ban",
        "tiep nhan", "chuyen xu ly", "phe duyet", "ky so", "phat hanh",
        "tao van ban", "tao moi", "chinh sua", "xoa", "chia se", "in an",
        "đặt lại mật khẩu", "thay đổi mật khẩu", "quên mật khẩu",
        "dat lai mat khau", "thay doi mat khau", "quen mat khau"
    );

    private static final List<String> DOCUMENT_SEARCH_KEYWORDS = List.of(
        "tìm kiếm", "tìm tài liệu", "tìm văn bản", "tra cứu",
        "tài liệu liên quan", "văn bản về", "văn bản nào",
        "có tài liệu nào", "cho tôi xem", "tìm cho tôi",
        "văn bản số", "công văn", "quyết định", "thông báo số",
        "tìm giúp", "tôi cần tìm", "tìm kiếm văn bản",
        "tôi muốn tìm", "có văn bản nào về",
        "tim kiem", "tim tai lieu", "tim van ban", "tra cuu",
        "tai lieu lien quan", "van ban ve", "van ban nao",
        "co tai lieu nao", "cho toi xem", "tim cho toi",
        "van ban so", "cong van", "quyet dinh", "thong bao so",
        "tim giup", "toi can tim", "toi muon tim"
    );

    // Overdue (system-wide) — fallthrough: if matches these but NOT "cua toi", it's system-wide
    private static final List<String> GENERAL_OVERDUE_KEYWORDS = List.of(
        "qua han", "tre han", "da qua han", "het han roi",
        "quá hạn", "trễ hạn", "đã quá hạn", "hết hạn rồi"
    );

    public IntentDetectionResult detect(String question) {
        String normalized = normalize(question);
        String original = question == null ? "" : question.toLowerCase(Locale.ROOT).trim();

        // Statistic detection first (highest priority — explicit metric)
        IntentDetectionResult statisticResult = detectStatistic(normalized, original);
        if (statisticResult != null) return statisticResult;

        // General overdue → MY_OVERDUE_DOCUMENT_COUNT
        if (matchesAny(normalized, GENERAL_OVERDUE_KEYWORDS) || matchesAny(original, GENERAL_OVERDUE_KEYWORDS)) {
            return new IntentDetectionResult(ChatbotIntent.SYSTEM_STATISTIC, ChatbotMetricCode.MY_OVERDUE_DOCUMENT_COUNT);
        }

        // User guide
        if (matchesAny(normalized, USER_GUIDE_KEYWORDS) || matchesAny(original, USER_GUIDE_KEYWORDS)) {
            return new IntentDetectionResult(ChatbotIntent.USER_GUIDE, null);
        }

        // Document search
        if (matchesAny(normalized, DOCUMENT_SEARCH_KEYWORDS) || matchesAny(original, DOCUMENT_SEARCH_KEYWORDS)) {
            return new IntentDetectionResult(ChatbotIntent.DOCUMENT_SEARCH, null);
        }

        // LLM fallback for ambiguous questions
        return detectWithLlmFallback(question);
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

    private IntentDetectionResult detectWithLlmFallback(String question) {
        if (question == null || question.isBlank() || question.length() < 5) {
            return new IntentDetectionResult(ChatbotIntent.GENERAL_HELP, null);
        }
        try {
            String systemPrompt = """
                Bạn là bộ phân loại intent cho chatbot hệ thống quản lý văn bản.
                Phân loại câu hỏi của người dùng vào một trong các intent sau:
                - DOCUMENT_SEARCH: người dùng muốn tìm kiếm, tra cứu tài liệu/văn bản
                - SYSTEM_STATISTIC: người dùng hỏi số liệu, thống kê về hệ thống
                - USER_GUIDE: người dùng hỏi cách sử dụng hệ thống, hướng dẫn thao tác
                - GENERAL_HELP: câu hỏi chung không thuộc các nhóm trên
                Chỉ trả về đúng một trong bốn tên intent trên, không thêm bất kỳ nội dung nào khác.
                """;
            String response = geminiService.chatWithSystem(systemPrompt,
                "Phân loại intent cho câu hỏi sau: " + question);
            ChatbotIntent intent = parseIntent(response.trim().toUpperCase());
            log.debug("LLM intent fallback: '{}' -> {}", question, intent);
            return new IntentDetectionResult(intent, null);
        } catch (Exception ex) {
            log.warn("LLM intent detection failed, falling back to GENERAL_HELP: {}", ex.getMessage());
            return new IntentDetectionResult(ChatbotIntent.GENERAL_HELP, null);
        }
    }

    private ChatbotIntent parseIntent(String raw) {
        if (raw.contains("DOCUMENT_SEARCH")) return ChatbotIntent.DOCUMENT_SEARCH;
        if (raw.contains("SYSTEM_STATISTIC")) return ChatbotIntent.SYSTEM_STATISTIC;
        if (raw.contains("USER_GUIDE")) return ChatbotIntent.USER_GUIDE;
        return ChatbotIntent.GENERAL_HELP;
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
