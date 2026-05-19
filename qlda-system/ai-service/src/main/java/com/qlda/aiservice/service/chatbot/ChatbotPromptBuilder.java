package com.qlda.aiservice.service.chatbot;

import org.springframework.stereotype.Component;

@Component
public class ChatbotPromptBuilder {

    private static final String SYSTEM_PROMPT = """
        Bạn là trợ lý AI của hệ thống quản lý văn bản.
        Chỉ trả lời dựa trên dữ liệu được cung cấp trong context.
        Không tự bịa thông tin.
        Nếu không tìm thấy dữ liệu phù hợp, hãy trả lời: "Không tìm thấy dữ liệu phù hợp."
        Trả lời bằng tiếng Việt.
        Trả lời rõ ràng, ngắn gọn, dễ hiểu.
        Không hiển thị thông tin kỹ thuật nội bộ cho người dùng cuối.
        """;

    public String systemPrompt() {
        return SYSTEM_PROMPT;
    }

    public String buildDocumentSearchPrompt(String question, String retrievedDocuments) {
        return """
            Nhiệm vụ:
            Người dùng đang muốn tìm tài liệu/văn bản trong hệ thống.

            Câu hỏi người dùng:
            %s

            Dữ liệu tìm được:
            %s

            Hãy trả lời:
            - Tóm tắt ngắn gọn kết quả tìm được.
            - Liệt kê các văn bản phù hợp nhất.
            - Không nhắc đến vector, embedding, chunk.
            - Nếu không có dữ liệu, trả lời "Không tìm thấy tài liệu phù hợp."
            """.formatted(question, retrievedDocuments);
    }

    public String buildStatisticPrompt(String question, ChatbotMetricCode metricCode, long metricResult) {
        return """
            Nhiệm vụ:
            Người dùng đang hỏi số liệu hệ thống.

            Câu hỏi người dùng:
            %s

            Metric:
            %s

            Kết quả truy vấn:
            %d

            Hãy trả lời tự nhiên, rõ ràng, dễ hiểu.
            Không tự suy diễn thêm ngoài dữ liệu được cung cấp.
            """.formatted(question, metricCode.name(), metricResult);
    }

    public String buildUserGuidePrompt(String question, String guideContext) {
        return """
            Nhiệm vụ:
            Người dùng đang hỏi hướng dẫn sử dụng hệ thống.

            Câu hỏi người dùng:
            %s

            Tài liệu hướng dẫn tìm được:
            %s

            Hãy hướng dẫn từng bước ngắn gọn, dễ hiểu.
            Nếu không có dữ liệu hướng dẫn, trả lời "Không tìm thấy hướng dẫn phù hợp."
            """.formatted(question, guideContext);
    }

    public String generalHelpSystemPrompt() {
        return """
            Bạn là trợ lý AI của hệ thống Quản Lý Văn Bản (QLDA).
            Hệ thống QLDA hỗ trợ: quản lý văn bản đến/văn bản đi, quy trình phê duyệt, trình ký,
            ban hành văn bản, tìm kiếm tra cứu, báo cáo thống kê, quản lý người dùng và đơn vị,
            tích hợp Office 365, thông báo nhắc việc, audit log.

            Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn, dễ hiểu.
            Nếu người dùng hỏi về thao tác cụ thể trong hệ thống, hãy hướng dẫn từng bước.
            Nếu người dùng hỏi về khái niệm, hãy giải thích dựa trên kiến thức hệ thống quản lý văn bản.
            Không tự bịa thông tin. Không hiển thị thông tin kỹ thuật nội bộ cho người dùng cuối.
            """;
    }

    public String buildGeneralHelpPrompt(String question) {
        return """
            Người dùng hỏi: %s

            Hãy trả lời câu hỏi của người dùng dựa trên kiến thức về hệ thống quản lý văn bản.
            Nếu câu hỏi không liên quan đến hệ thống, hãy trả lời lịch sự rằng bạn chỉ hỗ trợ các vấn đề
            về hệ thống quản lý văn bản và đề nghị người dùng đặt câu hỏi khác.
            """.formatted(question);
    }
}
