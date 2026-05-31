package com.qlda.aiservice.service;

import com.qlda.aiservice.entity.AiDocumentChunkEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GuideContentService {

    private static final Long GUIDE_SENTINEL_VAN_BAN_ID = 0L;

    private final VectorSearchService vectorSearchService;
    private final EmbeddingService embeddingService;

    // Pre-defined guide content for the QLDA system
    private static final List<String[]> GUIDE_SECTIONS = List.of(
        new String[]{"Đăng nhập hệ thống", """
            Hướng dẫn đăng nhập vào hệ thống QLDA:
            Bước 1: Mở trình duyệt web và truy cập địa chỉ hệ thống QLDA.
            Bước 2: Nhập tên đăng nhập (username) vào ô "Tên đăng nhập".
            Bước 3: Nhập mật khẩu vào ô "Mật khẩu".
            Bước 4: Nhấn nút "Đăng nhập" hoặc nhấn phím Enter.
            Bước 5: Nếu thông tin chính xác, bạn sẽ được chuyển vào trang chủ hệ thống.
            Lưu ý: Nếu quên mật khẩu, nhấn "Quên mật khẩu" để đặt lại qua email.
            """},
        new String[]{"Tải lên và nộp văn bản", """
            Hướng dẫn tải lên và nộp văn bản trong hệ thống:
            Bước 1: Vào menu "Văn bản" và chọn "Tải lên văn bản" hoặc nhấn nút "Upload".
            Bước 2: Điền thông tin văn bản: Trích yếu, Số ký hiệu, Ngày ban hành, Loại văn bản.
            Bước 3: Nhấn "Chọn file" và chọn file văn bản từ máy tính (hỗ trợ PDF, DOCX, XLSX).
            Bước 4: Kiểm tra lại thông tin đã điền, sau đó nhấn "Nộp văn bản" hoặc "Lưu".
            Bước 5: Hệ thống sẽ xử lý AI tự động (tóm tắt, phân loại) và lưu văn bản.
            Lưu ý: File không được vượt quá 50MB. Các trường bắt buộc phải điền đầy đủ.
            """},
        new String[]{"Tìm kiếm văn bản", """
            Hướng dẫn tìm kiếm văn bản trong hệ thống:
            Bước 1: Vào trang "Tìm kiếm" từ menu điều hướng.
            Bước 2: Nhập từ khóa vào ô tìm kiếm (số ký hiệu, trích yếu, nội dung).
            Bước 3: Chọn các bộ lọc nếu cần: loại văn bản, trạng thái, khoảng thời gian.
            Bước 4: Nhấn "Tìm kiếm" hoặc Enter để thực hiện tìm kiếm.
            Bước 5: Kết quả hiển thị danh sách văn bản phù hợp. Nhấn vào văn bản để xem chi tiết.
            Tính năng AI: Bật "Tìm kiếm thông minh AI" để tìm kiếm theo ngữ nghĩa, không cần từ khóa chính xác.
            """},
        new String[]{"Phê duyệt văn bản", """
            Hướng dẫn phê duyệt văn bản trong quy trình xử lý:
            Bước 1: Vào mục "Thông báo" hoặc "Hộp thư đến" để xem văn bản cần phê duyệt.
            Bước 2: Nhấn vào văn bản cần phê duyệt để xem chi tiết nội dung.
            Bước 3: Đọc kỹ nội dung văn bản và các ý kiến trước đó.
            Bước 4: Chọn "Phê duyệt" (đồng ý) hoặc "Từ chối" (không đồng ý).
            Bước 5: Nhập ý kiến/ghi chú vào ô bình luận (bắt buộc khi từ chối).
            Bước 6: Nhấn "Xác nhận" để hoàn tất quyết định phê duyệt.
            Lưu ý: Sau khi phê duyệt, văn bản sẽ chuyển sang bước tiếp theo trong quy trình.
            """},
        new String[]{"Ký số điện tử", """
            Hướng dẫn ký số điện tử văn bản:
            Bước 1: Mở văn bản cần ký từ danh sách hoặc thông báo.
            Bước 2: Nhấn nút "Ký số" trong giao diện chi tiết văn bản.
            Bước 3: Chọn chứng thư số (certificate) từ danh sách thiết bị ký.
            Bước 4: Nhập mã PIN của thiết bị ký nếu được yêu cầu.
            Bước 5: Xác nhận ký số — hệ thống sẽ tạo chữ ký điện tử và gắn vào văn bản.
            Bước 6: Văn bản đã ký sẽ được lưu và chuyển sang bước tiếp theo.
            Lưu ý: Cần cài đặt phần mềm ký số và kết nối thiết bị token/USB ký số.
            """},
        new String[]{"Quản lý thông báo", """
            Hướng dẫn quản lý thông báo trong hệ thống:
            Bước 1: Nhấn vào biểu tượng chuông thông báo trên thanh menu hoặc vào mục "Thông báo".
            Bước 2: Danh sách thông báo hiển thị theo thứ tự mới nhất. Thông báo chưa đọc được đánh dấu riêng.
            Bước 3: Nhấn vào thông báo để đọc chi tiết và đánh dấu đã đọc.
            Bước 4: Nhấn "Đánh dấu tất cả đã đọc" để xóa toàn bộ thông báo chưa đọc.
            Bước 5: Có thể lọc thông báo theo loại: Hệ thống, Phê duyệt, Nhắc việc, SLA.
            Bước 6: Nhấn nút ✕ để xóa thông báo không cần thiết.
            """},
        new String[]{"Xem báo cáo thống kê", """
            Hướng dẫn xem báo cáo và thống kê hệ thống:
            Bước 1: Vào menu "Báo cáo" từ thanh điều hướng (dành cho Admin/quản lý).
            Bước 2: Chọn khoảng thời gian cần xem: nhập ngày bắt đầu và kết thúc, rồi nhấn "Lọc".
            Bước 3: Xem các chỉ số tổng quan: tổng văn bản, tỉ lệ hoàn thành, số quá hạn.
            Bước 4: Xem biểu đồ phân tích văn bản theo tháng trong mục "Số văn bản theo tháng".
            Bước 5: Xem danh sách văn bản quá hạn trong mục "Văn bản quá hạn chưa xử lý".
            Bước 6: Xuất báo cáo bằng cách nhấn "Xuất CSV", "Xuất Excel" hoặc "Xuất PDF".
            """},
        new String[]{"Quản lý quy trình xử lý", """
            Hướng dẫn quản lý quy trình (workflow) xử lý văn bản:
            Bước 1: Vào menu "Quản lý" → "Quy trình xử lý" (chỉ dành cho Admin).
            Bước 2: Danh sách quy trình hiện có được hiển thị. Nhấn "Thêm mới" để tạo quy trình.
            Bước 3: Điền tên quy trình, mã quy trình và bật/tắt trạng thái sử dụng.
            Bước 4: Thêm các bước xử lý: nhập tên bước, vai trò phụ trách, thời gian xử lý.
            Bước 5: Sắp xếp thứ tự các bước bằng cách kéo thả hoặc chỉnh số thứ tự.
            Bước 6: Nhấn "Lưu" để hoàn tất tạo/chỉnh sửa quy trình.
            """},
        new String[]{"Quản lý người dùng và phân quyền", """
            Hướng dẫn quản lý người dùng và phân quyền (dành cho Admin):
            Bước 1: Vào menu "Quản lý" → "Người dùng".
            Bước 2: Xem danh sách người dùng, tìm kiếm theo tên hoặc email.
            Bước 3: Nhấn "Thêm người dùng" để tạo tài khoản mới, điền thông tin và chọn vai trò.
            Bước 4: Nhấn vào người dùng để chỉnh sửa thông tin hoặc đổi vai trò.
            Bước 5: Vào "Phân quyền" để xem và chỉnh sửa quyền hạn của từng vai trò.
            Bước 6: Nhấn "Lưu" để cập nhật thay đổi phân quyền.
            """},
        new String[]{"Cấu hình SLA và theo dõi vi phạm", """
            Hướng dẫn cấu hình SLA (Service Level Agreement) và theo dõi vi phạm:
            Bước 1: Vào menu "Quản lý" → "Quản lý SLA" (chỉ dành cho Admin).
            Bước 2: Chọn quy trình cần cấu hình SLA từ danh sách thả xuống.
            Bước 3: Danh sách các bước trong quy trình hiển thị kèm thời gian xử lý hiện tại.
            Bước 4: Nhấn "Chỉnh sửa" tại bước cần thay đổi, nhập thời gian và đơn vị (phút/giờ/ngày).
            Bước 5: Nhấn "Lưu" để cập nhật cấu hình SLA cho bước đó.
            Bước 6: Chuyển sang tab "Vi phạm SLA" để xem danh sách văn bản đang vi phạm hạn xử lý.
            """},
        new String[]{"Sử dụng trợ lý AI chatbot", """
            Hướng dẫn sử dụng trợ lý AI trong hệ thống QLDA:
            Bước 1: Nhấn vào nút "AI" ở góc dưới bên phải màn hình để mở cửa sổ trợ lý.
            Bước 2: Trợ lý AI hỗ trợ 3 nhóm câu hỏi chính:
              - Tìm tài liệu: "Tìm cho tôi văn bản về ngân sách năm 2024"
              - Số liệu hệ thống: "Hệ thống có bao nhiêu văn bản đến?" hoặc "Tôi có bao nhiêu việc chờ xử lý?"
              - Hướng dẫn sử dụng: "Làm sao để phê duyệt văn bản?" hoặc "Cách upload văn bản?"
            Bước 3: Nhập câu hỏi vào ô nhập liệu và nhấn "Gửi" hoặc Enter.
            Bước 4: Đợi trợ lý trả lời, có thể hỏi tiếp dựa trên câu trả lời trước.
            Bước 5: Nhấn 👍 hoặc 👎 để đánh giá chất lượng câu trả lời.
            Lưu ý: Cần đăng nhập mới sử dụng được trợ lý AI.
            """},
        new String[]{"Xem và xử lý văn bản đến", """
            Hướng dẫn xem và xử lý văn bản đến:
            Bước 1: Vào menu "Văn bản đến" từ thanh điều hướng.
            Bước 2: Danh sách văn bản đến hiển thị. Có thể lọc theo trạng thái, ngày, loại văn bản.
            Bước 3: Nhấn vào tên văn bản để xem chi tiết: nội dung, tệp đính kèm, lịch sử xử lý.
            Bước 4: Tại trang chi tiết, có thể thực hiện các thao tác: Phê duyệt, Chuyển xử lý, Góp ý.
            Bước 5: Sử dụng tab AI để xem tóm tắt AI, gợi ý xử lý, hoặc thực hiện OCR tệp đính kèm.
            Bước 6: Sau khi xử lý xong, nhấn "Hoàn thành" để cập nhật trạng thái văn bản.
            """}
    );

    @PostConstruct
    @Async
    public void seedIfEmpty() {
        try {
            long count = vectorSearchService.countGuideChunks();
            if (count > 0) {
                log.info("Guide content already seeded ({} chunks), skipping.", count);
                return;
            }
            log.info("Seeding user guide content into vector DB...");
            seedGuideContent();
            log.info("User guide content seeded successfully ({} sections).", GUIDE_SECTIONS.size());
        } catch (Exception ex) {
            log.warn("Guide content seeding failed (will retry on next restart): {}", ex.getMessage());
        }
    }

    public void seedGuideContent() {
        List<AiDocumentChunkEntity> chunks = new ArrayList<>();
        int chunkIndex = 0;
        for (String[] section : GUIDE_SECTIONS) {
            String title = section[0];
            String content = section[1].trim();
            List<Double> embedding = embeddingService.generateEmbedding(content);
            String vectorStr = vectorSearchService.toVectorString(embedding);
            String metadata = """
                {"type":"huong_dan","title":"%s"}
                """.formatted(title.replace("\"", "'")).trim();

            AiDocumentChunkEntity chunk = AiDocumentChunkEntity.builder()
                .vanBanId(GUIDE_SENTINEL_VAN_BAN_ID)
                .chunkIndex(chunkIndex++)
                .noiDung(content)
                .embedding(vectorStr)
                .metadata(metadata)
                .ngayTao(LocalDateTime.now())
                .build();
            chunks.add(chunk);
        }
        vectorSearchService.insertChunks(chunks);
    }
}
