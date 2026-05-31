package com.qlda.aiservice.service.chatbot;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ChatbotPromptBuilder {

    private static final String SYSTEM_PROMPT = """
        Bạn là trợ lý AI của hệ thống quản lý văn bản QLDA.
        Chỉ trả lời dựa trên dữ liệu được cung cấp trong context.
        Không tự bịa thông tin.
        Nếu không tìm thấy dữ liệu phù hợp, hãy trả lời: "Không tìm thấy dữ liệu phù hợp."
        Trả lời bằng tiếng Việt.
        Trả lời rõ ràng, ngắn gọn, dễ hiểu.
        Không hiển thị thông tin kỹ thuật nội bộ (vector, embedding, chunk, id) cho người dùng.
        """;

    private static final Map<ChatbotMetricCode, String> METRIC_LABELS = Map.of(
        ChatbotMetricCode.MY_UPLOADED_DOCUMENT_COUNT, "Văn bản tôi đã tải lên",
        ChatbotMetricCode.MY_PENDING_DOCUMENT_COUNT, "Văn bản đang chờ tôi xử lý",
        ChatbotMetricCode.MY_COMPLETED_DOCUMENT_COUNT, "Văn bản tôi đã hoàn thành",
        ChatbotMetricCode.MY_DUE_SOON_DOCUMENT_COUNT, "Văn bản sắp đến hạn",
        ChatbotMetricCode.MY_OVERDUE_DOCUMENT_COUNT, "Văn bản quá hạn của tôi",
        ChatbotMetricCode.TOTAL_DOCUMENT_COUNT, "Tổng văn bản hệ thống",
        ChatbotMetricCode.TOTAL_USER_COUNT, "Tổng người dùng hệ thống",
        ChatbotMetricCode.TOTAL_INCOMING_DOCUMENT_COUNT, "Tổng văn bản đến",
        ChatbotMetricCode.SLA_VIOLATION_COUNT, "Vi phạm SLA hiện tại",
        ChatbotMetricCode.DOCUMENT_THIS_MONTH_COUNT, "Văn bản tháng này"
    );

    public String systemPrompt() {
        return SYSTEM_PROMPT;
    }

    public String getMetricLabel(ChatbotMetricCode code) {
        return METRIC_LABELS.getOrDefault(code, code.name());
    }

    public String buildConversationContext(List<Map<String, String>> history) {
        if (history == null || history.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("Lịch sử hội thoại gần đây:\n");
        for (Map<String, String> msg : history) {
            String role = "bot".equalsIgnoreCase(msg.get("role")) ? "Trợ lý" : "Người dùng";
            sb.append(role).append(": ").append(msg.get("content")).append("\n");
        }
        sb.append("\n");
        return sb.toString();
    }

    public String buildDocumentSearchPrompt(String question, String retrievedDocuments,
                                             List<Map<String, String>> conversationHistory) {
        String context = buildConversationContext(conversationHistory);
        return """
            %sNhiệm vụ:
            Người dùng đang muốn tìm tài liệu/văn bản trong hệ thống.

            Câu hỏi người dùng:
            %s

            Dữ liệu tìm được từ hệ thống:
            %s

            Hãy trả lời:
            - Tóm tắt ngắn gọn các văn bản tìm được.
            - Liệt kê tên/mã các văn bản phù hợp nhất.
            - Không nhắc đến vector, embedding, chunk, id kỹ thuật.
            - Nếu không có dữ liệu, trả lời "Không tìm thấy tài liệu phù hợp."
            """.formatted(context, question, retrievedDocuments);
    }

    public String buildStatisticPrompt(String question, ChatbotMetricCode metricCode,
                                        long metricResult, List<Map<String, String>> conversationHistory) {
        String context = buildConversationContext(conversationHistory);
        String label = getMetricLabel(metricCode);
        return """
            %sNhiệm vụ:
            Người dùng đang hỏi số liệu hệ thống.

            Câu hỏi người dùng:
            %s

            Chỉ số: %s
            Giá trị: %d

            Hãy trả lời tự nhiên, thân thiện, rõ ràng. Ví dụ: "Hiện tại hệ thống có X văn bản đến."
            Không tự suy diễn thêm ngoài dữ liệu được cung cấp.
            """.formatted(context, question, label, metricResult);
    }

    public String buildUserGuidePrompt(String question, String guideContext,
                                        List<Map<String, String>> conversationHistory,
                                        String currentModule) {
        String context = buildConversationContext(conversationHistory);
        String moduleHint = (currentModule != null && !currentModule.isBlank())
            ? "Người dùng hiện đang ở trang: " + currentModule + "\n\n"
            : "";
        return """
            %s%sNhiệm vụ:
            Người dùng đang hỏi hướng dẫn sử dụng hệ thống.

            Câu hỏi người dùng:
            %s

            Tài liệu hướng dẫn tìm được:
            %s

            Hãy hướng dẫn từng bước rõ ràng, sử dụng định dạng đánh số:
            Bước 1: ...
            Bước 2: ...
            Bước 3: ...
            Nếu không có dữ liệu hướng dẫn phù hợp, trả lời "Không tìm thấy hướng dẫn phù hợp. Vui lòng liên hệ quản trị viên."
            """.formatted(context, moduleHint, question, guideContext);
    }

    public String generalHelpSystemPrompt() {
        return """
            Bạn là trợ lý AI của hệ thống Quản Lý Văn Bản (QLDA).
            Hệ thống QLDA hỗ trợ: quản lý văn bản đến/văn bản đi, quy trình phê duyệt, trình ký,
            ban hành văn bản, tìm kiếm tra cứu, báo cáo thống kê, quản lý người dùng và đơn vị,
            tích hợp Office 365, thông báo nhắc việc, audit log, phân quyền.

            Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn, thân thiện.
            Nếu người dùng hỏi về thao tác cụ thể trong hệ thống, hướng dẫn từng bước có đánh số.
            Nếu người dùng hỏi về khái niệm, giải thích dựa trên kiến thức hệ thống quản lý văn bản.
            Không tự bịa thông tin. Không hiển thị thông tin kỹ thuật nội bộ cho người dùng cuối.
            """;
    }

    public String buildGeneralHelpPrompt(String question, List<Map<String, String>> conversationHistory) {
        String context = buildConversationContext(conversationHistory);
        return """
            %sNgười dùng hỏi: %s

            Hãy trả lời câu hỏi dựa trên kiến thức về hệ thống quản lý văn bản.
            Nếu câu hỏi không liên quan, hãy trả lời lịch sự rằng bạn chỉ hỗ trợ các vấn đề
            về hệ thống quản lý văn bản.
            """.formatted(context, question);
    }

    // Legacy overloads for backward compatibility
    public String buildDocumentSearchPrompt(String question, String retrievedDocuments) {
        return buildDocumentSearchPrompt(question, retrievedDocuments, null);
    }

    public String buildStatisticPrompt(String question, ChatbotMetricCode metricCode, long metricResult) {
        return buildStatisticPrompt(question, metricCode, metricResult, null);
    }

    public String buildUserGuidePrompt(String question, String guideContext) {
        return buildUserGuidePrompt(question, guideContext, null, null);
    }

    public String buildGeneralHelpPrompt(String question) {
        return buildGeneralHelpPrompt(question, null);
    }
}
