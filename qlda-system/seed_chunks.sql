SET client_encoding = 'UTF8';

TRUNCATE ai_document_chunk;

-- =============================================
-- AI Knowledge Base — Hệ thống QLDA
-- Dữ liệu huấn luyện cho AI Chatbot & Semantic Search
-- van_ban_id phải trỏ đến văn bản tồn tại trong bảng vanban
-- Embedding dùng zero vector — AI service sẽ tính lại khi index thực tế
-- =============================================

INSERT INTO ai_document_chunk (van_ban_id, tep_dinh_kem_id, chunk_index, noi_dung, embedding, metadata)
VALUES

-- ============================================================
-- NHÓM 1: ĐĂNG NHẬP & TÀI KHOẢN
-- van_ban_id = 5011 (CV báo cáo triển khai hệ thống)
-- ============================================================

(5011, NULL, 0,
 'Hướng dẫn đăng nhập hệ thống QLDA: Truy cập http://localhost:5173, nhấn nút "Đăng nhập với Microsoft". Trình duyệt chuyển sang trang Microsoft, nhập tài khoản email DUT (@sv1.dut.udn.vn) và mật khẩu. Nếu lần đầu đăng nhập sẽ có màn hình xin quyền, nhấn Chấp nhận. Hệ thống tự động nhận diện tài khoản và chuyển vào Dashboard.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "dang_nhap", "title": "Đăng nhập hệ thống bằng Azure SSO"}'),

(5011, NULL, 1,
 'Hệ thống QLDA sử dụng xác thực Azure Active Directory (Microsoft SSO) của Đại học Đà Nẵng. Chỉ tài khoản email @sv1.dut.udn.vn hoặc tài khoản đơn vị được cấp phép mới đăng nhập được. Không cần nhớ mật khẩu riêng cho hệ thống QLDA.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "dang_nhap", "title": "Thông tin xác thực Azure SSO"}'),

(5011, NULL, 2,
 'Hướng dẫn đăng xuất khỏi hệ thống QLDA: Nhấn vào tên người dùng ở thanh bên trái, chọn "Đăng xuất". Hệ thống xóa phiên làm việc và chuyển về màn hình đăng nhập. Sau khi đăng xuất, không thể truy cập các trang nội bộ nếu gõ trực tiếp URL.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "dang_nhap", "title": "Đăng xuất hệ thống"}'),

(5011, NULL, 3,
 'Xem và cập nhật hồ sơ cá nhân: Vào menu "Hồ sơ cá nhân" ở sidebar. Trang hiển thị thông tin: họ tên, email, đơn vị công tác, chức vụ, nhóm quyền. Thông tin đồng bộ tự động từ tài khoản Azure AD không cần nhập lại.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "tai_khoan", "title": "Xem hồ sơ cá nhân"}'),

(5011, NULL, 4,
 'Vai trò và quyền hạn trong hệ thống: ADMIN có toàn quyền quản trị hệ thống, quản lý người dùng, xem báo cáo. MANAGER (Trưởng đơn vị) có quyền phê duyệt văn bản và quản lý đơn vị. USER (Chuyên viên) tạo, upload, chuyển xử lý văn bản thông thường.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "phan_quyen", "title": "Vai trò và quyền hạn người dùng"}'),

-- ============================================================
-- NHÓM 2: VĂN BẢN ĐẾN (INBOX)
-- van_ban_id = 5001 (CV phân bổ kinh phí)
-- ============================================================

(5001, NULL, 0,
 'Hướng dẫn xem danh sách văn bản đến: Vào mục "Văn bản đến" ở sidebar (đường dẫn /inbox). Trang hiển thị danh sách tất cả văn bản đến kèm số ký hiệu, trích yếu, đơn vị ban hành, ngày tiếp nhận, độ khẩn và trạng thái xử lý. Nhấn vào một dòng để xem chi tiết.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_den", "title": "Xem danh sách văn bản đến"}'),

(5001, NULL, 1,
 'Hướng dẫn xem chi tiết văn bản: Nhấn vào một văn bản trong danh sách để mở trang chi tiết. Trang hiển thị đầy đủ: số ký hiệu, trích yếu, loại văn bản, đơn vị ban hành, người ký, ngày tiếp nhận, hạn xử lý, độ mật, độ khẩn, file đính kèm và lịch sử xử lý.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_den", "title": "Xem chi tiết văn bản"}'),

(5001, NULL, 2,
 'Hướng dẫn chuyển xử lý văn bản đến: Tại trang chi tiết hoặc từ danh sách, nhấn nút "Chuyển xử lý". Chọn người nhận từ danh sách, chọn đơn vị xử lý, điền nội dung chuyển, đặt hạn xử lý. Nhấn "Xác nhận chuyển". Người nhận sẽ nhận được thông báo ngay.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_den", "title": "Chuyển xử lý văn bản"}'),

(5001, NULL, 3,
 'Trạng thái văn bản đến: Nháp (0) - chưa hoàn thiện; Đang xử lý (1) - đã tiếp nhận đang xử lý; Đã chuyển xử lý (2) - đã giao cho người khác; Trình ký (3) - đang chờ ký; Đã ký (4) - đã được ký duyệt; Đã phát hành (5) - đã ban hành chính thức.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "van_ban_den", "title": "Các trạng thái văn bản"}'),

(5001, NULL, 4,
 'Phân loại độ khẩn văn bản: BINH_THUONG (Bình thường) - xử lý theo quy trình thông thường; KHAN (Khẩn) - ưu tiên xử lý trong 2 ngày; THUONG_KHAN (Thượng khẩn) - xử lý trong 24 giờ; HOA_TOC (Hỏa tốc) - xử lý ngay lập tức. Văn bản khẩn hiển thị badge màu đỏ.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "van_ban_den", "title": "Phân loại độ khẩn văn bản"}'),

(5001, NULL, 5,
 'Upload văn bản mới vào hệ thống: Vào mục "Upload" ở sidebar. Kéo thả file PDF hoặc DOCX vào vùng upload, hoặc nhấn để chọn file. Điền thông tin: số ký hiệu, trích yếu, loại văn bản, đơn vị ban hành, ngày văn bản. Nhấn "Lưu". File được lưu vào hệ thống và xuất hiện trong danh sách văn bản đến.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_den", "title": "Upload văn bản vào hệ thống"}'),

-- ============================================================
-- NHÓM 3: VĂN BẢN ĐI
-- van_ban_id = 5012 (CV đề xuất nâng cấp hạ tầng)
-- ============================================================

(5012, NULL, 0,
 'Hướng dẫn xem danh sách văn bản đi: Vào mục "Văn bản đi" ở sidebar (đường dẫn /outgoing). Trang hiển thị tất cả văn bản do đơn vị soạn thảo và gửi đi, kèm trạng thái xử lý hiện tại.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_di", "title": "Xem danh sách văn bản đi"}'),

(5012, NULL, 1,
 'Hướng dẫn tạo văn bản đi mới: Vào "Văn bản đi", nhấn "+ Tạo văn bản đi". Điền đầy đủ thông tin: số ký hiệu, trích yếu, loại văn bản, đơn vị chủ trì, ngày văn bản, độ khẩn, người ký. Đính kèm file nếu có. Nhấn "Lưu". Văn bản được tạo ở trạng thái Nháp.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_di", "title": "Tạo văn bản đi mới"}'),

(5012, NULL, 2,
 'Hướng dẫn trình duyệt văn bản đi: Sau khi hoàn thiện nội dung, nhấn nút "Trình duyệt" tại trang chi tiết văn bản. Chọn quy trình phê duyệt phù hợp, điền ghi chú nếu cần. Nhấn "Xác nhận". Văn bản chuyển sang trạng thái "Trình ký" và người phê duyệt nhận thông báo.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_di", "title": "Trình duyệt văn bản đi"}'),

(5012, NULL, 3,
 'Theo dõi trạng thái văn bản đi: Vào danh sách văn bản đi, xem cột trạng thái. Nháp - chưa trình; Đang xử lý - đã gửi chờ xử lý; Trình ký - đang chờ phê duyệt; Đã ký - được chấp thuận; Đã phát hành - ban hành chính thức; Từ chối - bị trả lại cần chỉnh sửa.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_di", "title": "Theo dõi trạng thái văn bản đi"}'),

-- ============================================================
-- NHÓM 4: QUY TRÌNH PHÊ DUYỆT (APPROVALS)
-- van_ban_id = 5013 (Báo cáo quý I)
-- ============================================================

(5013, NULL, 0,
 'Hướng dẫn xem danh sách văn bản chờ phê duyệt: Vào mục "Phê duyệt" ở sidebar (đường dẫn /approvals). Trang hiển thị tất cả văn bản đang chờ bạn phê duyệt, kèm số ký hiệu, trích yếu, người gửi, ngày trình và hạn xử lý.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "phe_duyet", "title": "Xem danh sách chờ phê duyệt"}'),

(5013, NULL, 1,
 'Hướng dẫn phê duyệt đồng ý văn bản: Tại trang /approvals, nhấn nút "Phê duyệt" (màu xanh ✅) ở dòng văn bản cần duyệt. Hộp thoại hiện ra, điền ý kiến phê duyệt. Nhấn "Xác nhận phê duyệt". Hệ thống cập nhật trạng thái và gửi thông báo cho người trình.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "phe_duyet", "title": "Phê duyệt đồng ý văn bản"}'),

(5013, NULL, 2,
 'Hướng dẫn từ chối phê duyệt văn bản: Tại trang /approvals, nhấn nút "Từ chối" (màu đỏ 🚫). Nhập rõ lý do từ chối để người soạn thảo biết cần chỉnh sửa gì. Nhấn "Xác nhận từ chối". Văn bản trả lại người tạo kèm thông báo.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "phe_duyet", "title": "Từ chối phê duyệt văn bản"}'),

(5013, NULL, 3,
 'Hướng dẫn ghi chú / yêu cầu bổ sung: Tại trang /approvals, nhấn nút "Ghi chú" (💬). Nhập nội dung yêu cầu bổ sung hoặc câu hỏi cần làm rõ. Nhấn "Gửi ghi chú". Văn bản vẫn ở trạng thái chờ duyệt, người gửi nhận được thông báo có ghi chú mới.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "phe_duyet", "title": "Ghi chú yêu cầu bổ sung"}'),

(5013, NULL, 4,
 'Quy trình phê duyệt công văn thông thường (QT-CV-THUONG) gồm 3 bước: Bước 1 - Chuyên viên tiếp nhận và xử lý (48 giờ); Bước 2 - Trưởng phòng xem xét và ký nháy (24 giờ, bắt buộc); Bước 3 - Ban Giám đốc phê duyệt cuối (48 giờ, bắt buộc). Tổng thời gian tối đa 5 ngày làm việc.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "topic": "phe_duyet", "title": "Quy trình công văn thông thường 3 bước"}'),

(5013, NULL, 5,
 'Quy trình phê duyệt nhanh (QT-NHANH) gồm 2 bước: Bước 1 - Chuyên viên soạn thảo và chuẩn bị hồ sơ (24 giờ); Bước 2 - Quản trị viên phê duyệt (24 giờ, bắt buộc). Áp dụng cho các công văn đơn giản, nội bộ, không cần qua nhiều cấp duyệt. Tổng thời gian tối đa 2 ngày.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "topic": "phe_duyet", "title": "Quy trình phê duyệt nhanh 2 bước"}'),

(5013, NULL, 6,
 'Quy trình nghiệm thu dự án (QT-NGHIEM-THU) gồm 4 bước: Bước 1 - Lập biên bản thực địa (24 giờ); Bước 2 - Thẩm định kỹ thuật (48 giờ, bắt buộc); Bước 3 - Trưởng phòng ký xác nhận (24 giờ, bắt buộc); Bước 4 - Ban Giám đốc phê duyệt cuối (48 giờ, bắt buộc). Tổng thời gian tối đa 6 ngày làm việc.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "topic": "phe_duyet", "title": "Quy trình nghiệm thu dự án 4 bước"}'),

-- ============================================================
-- NHÓM 5: TÌM KIẾM VĂN BẢN
-- van_ban_id = 5015 (CV phối hợp hội thảo)
-- ============================================================

(5015, NULL, 0,
 'Hướng dẫn tìm kiếm văn bản: Vào mục "Tìm kiếm" ở sidebar (đường dẫn /search). Nhập từ khóa vào ô tìm kiếm — có thể tìm theo số ký hiệu, trích yếu, tên đơn vị ban hành, tên người ký. Nhấn Enter hoặc nút "Tìm". Kết quả hiển thị danh sách các văn bản phù hợp.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "tim_kiem", "title": "Tìm kiếm văn bản cơ bản"}'),

(5015, NULL, 1,
 'Tìm kiếm văn bản với bộ lọc nâng cao: Sau khi có kết quả tìm kiếm, dùng bộ lọc ở sidebar để thu hẹp: chọn Loại văn bản (Công văn, Biên bản, Đề xuất, Quyết định), chọn Trạng thái, chọn khoảng thời gian từ ngày đến ngày, chọn Độ khẩn. Kết quả cập nhật ngay khi chọn lọc.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "tim_kiem", "title": "Tìm kiếm văn bản với bộ lọc"}'),

(5015, NULL, 2,
 'Tìm kiếm AI (semantic search): Hệ thống hỗ trợ tìm kiếm ngữ nghĩa bằng AI. Thay vì tìm theo từ khóa chính xác, có thể mô tả nội dung cần tìm bằng câu tự nhiên, ví dụ: "văn bản về phân bổ kinh phí quý 2" hoặc "biên bản họp tháng 5". AI sẽ tìm các văn bản có nội dung liên quan dù không khớp từ khóa.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "tim_kiem", "title": "Tìm kiếm ngữ nghĩa bằng AI"}'),

(5015, NULL, 3,
 'Tiếp nhận và phân loại văn bản đến: Tại danh sách văn bản đến, xác nhận đã tiếp nhận bằng cách xem chi tiết. Để phân loại, xem trường Loại văn bản, Độ khẩn, Độ mật. Các thông tin này được điền khi upload. Văn bản khẩn hiển thị badge đỏ, thượng khẩn hiển thị badge đỏ đậm.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "van_ban_den", "title": "Tiếp nhận và phân loại văn bản đến"}'),

(5015, NULL, 4,
 'Quy trình xử lý văn bản đến đầy đủ: (1) Tiếp nhận văn bản đến qua upload hoặc hệ thống tự nhận; (2) Chuyên viên xem xét, phân loại; (3) Chuyển xử lý lên lãnh đạo hoặc giao cho người liên quan; (4) Lãnh đạo xem xét, chỉ đạo; (5) Chuyên viên soạn thảo trả lời nếu cần; (6) Trình ký, phê duyệt, ban hành.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "topic": "van_ban_den", "title": "Quy trình xử lý văn bản đến đầy đủ"}'),

-- ============================================================
-- NHÓM 6: THÔNG BÁO & NHẮC VIỆC
-- van_ban_id = 5016 (Nháp đề xuất ngân sách)
-- ============================================================

(5016, NULL, 0,
 'Hướng dẫn xem thông báo: Vào mục "Thông báo" ở sidebar (đường dẫn /notifications) hoặc nhấn icon chuông 🔔 ở đầu trang. Danh sách thông báo hiển thị từ mới nhất đến cũ, kèm loại thông báo, thời gian và trạng thái đã đọc/chưa đọc.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "thong_bao", "title": "Xem thông báo hệ thống"}'),

(5016, NULL, 1,
 'Các loại thông báo trong hệ thống: VAN_BAN - có văn bản mới hoặc văn bản thay đổi trạng thái; PHE_DUYET - văn bản chờ phê duyệt hoặc kết quả phê duyệt; HE_THONG - thông báo từ hệ thống (đăng nhập, lỗi). Thông báo chưa đọc hiển thị nổi bật, nhấn để đánh dấu đã đọc.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thong_bao", "title": "Các loại thông báo hệ thống"}'),

(5016, NULL, 2,
 'Hệ thống tự động gửi thông báo khi: Văn bản mới được chuyển đến bạn; Văn bản bạn gửi được phê duyệt hoặc từ chối; Văn bản sắp đến hạn xử lý (còn 2-3 ngày); Văn bản đã quá hạn xử lý; Có ghi chú mới trên văn bản bạn trình duyệt.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thong_bao", "title": "Điều kiện gửi thông báo tự động"}'),

(5016, NULL, 3,
 'Hướng dẫn xem văn bản quá hạn: Vào trang Báo cáo (/admin/reports), xem phần "Văn bản quá hạn chưa xử lý" ở cuối trang. Bảng hiển thị mã văn bản, nội dung trích yếu và số ngày trễ. Văn bản quá hạn thể hiện bằng con số màu đỏ.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "thong_bao", "title": "Xem văn bản quá hạn xử lý"}'),

-- ============================================================
-- NHÓM 7: ỦY QUYỀN
-- van_ban_id = 5017 (CV phản hồi bảo mật)
-- ============================================================

(5017, NULL, 0,
 'Hướng dẫn tạo ủy quyền: Vào mục "Ủy quyền" ở sidebar (đường dẫn /delegation). Nhấn "+ Tạo ủy quyền". Chọn người được ủy quyền từ danh sách. Đặt thời gian: từ ngày, đến ngày. Mô tả phạm vi ủy quyền (ví dụ: Ký duyệt công văn trong khi đi công tác). Nhấn "Tạo ủy quyền".',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "uy_quyen", "title": "Tạo ủy quyền"}'),

(5017, NULL, 1,
 'Hướng dẫn hủy ủy quyền: Tại trang Ủy quyền, tìm bản ủy quyền đang hiệu lực, nhấn nút "Hủy" hoặc "Xóa". Xác nhận trong hộp thoại. Ủy quyền bị hủy ngay lập tức, người được ủy quyền không còn thay mặt bạn xử lý văn bản.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "uy_quyen", "title": "Hủy ủy quyền"}'),

(5017, NULL, 2,
 'Quy tắc ủy quyền: Mỗi người chỉ nên có 1 ủy quyền đang hiệu lực tại một thời điểm. Ủy quyền có giới hạn thời gian bắt buộc (từ ngày - đến ngày). Phạm vi ủy quyền cần ghi rõ để tránh lạm dụng. Hệ thống hiển thị badge "Hiệu lực" (xanh) hoặc "Hết hạn" (xám) theo trạng thái thực tế.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "uy_quyen", "title": "Quy tắc và lưu ý về ủy quyền"}'),

-- ============================================================
-- NHÓM 8: HỒ SƠ CÔNG VIỆC
-- van_ban_id = 5018 (Biên bản họp triển khai)
-- ============================================================

(5018, NULL, 0,
 'Hướng dẫn xem hồ sơ công việc: Vào mục "Hồ sơ" ở sidebar (đường dẫn /case-files). Trang hiển thị danh sách hồ sơ đang quản lý kèm mã hồ sơ, tên, văn bản liên quan, người phụ trách, trạng thái.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "ho_so", "title": "Xem danh sách hồ sơ công việc"}'),

(5018, NULL, 1,
 'Hướng dẫn tạo hồ sơ mới: Tại trang /case-files, nhấn "+ Tạo hồ sơ". Điền: Mã hồ sơ (duy nhất, ví dụ HS-2026-001), Tên hồ sơ, Năm lưu, Đơn vị quản lý, Ghi chú nếu cần. Có thể liên kết với văn bản cụ thể. Nhấn "Lưu". Hồ sơ xuất hiện trong danh sách.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "ho_so", "title": "Tạo hồ sơ công việc mới"}'),

-- ============================================================
-- NHÓM 9: QUẢN TRỊ HỆ THỐNG (ADMIN)
-- van_ban_id = 5007 (QĐ thành lập Ban Kiểm soát)
-- ============================================================

(5007, NULL, 0,
 'Hướng dẫn quản lý người dùng: Vào Quản trị → Quản lý người dùng (/admin/users). Danh sách hiển thị tất cả tài khoản. Nhấn "+ Thêm người dùng" để tạo mới: điền username, họ tên, email, đơn vị, chức vụ, nhóm quyền. Nhấn "Lưu". Tài khoản mới có thể đăng nhập ngay.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Quản lý người dùng"}'),

(5007, NULL, 1,
 'Hướng dẫn khóa / mở khóa tài khoản: Tại trang quản lý người dùng, tìm tài khoản cần xử lý, nhấn nút "Khóa" (trạng thái chuyển thành Không hoạt động) hoặc "Mở khóa". Tài khoản bị khóa không thể đăng nhập hệ thống dù có tài khoản Azure hợp lệ.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Khóa mở khóa tài khoản"}'),

(5007, NULL, 2,
 'Hướng dẫn quản lý đơn vị tổ chức: Vào Quản trị → Quản lý đơn vị (/admin/units). Xem danh sách phòng ban dạng cây. Nhấn "+ Thêm đơn vị": điền mã đơn vị, tên, đơn vị cha (nếu là phòng ban con), điện thoại, email, địa chỉ. Nhấn "Lưu".',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Quản lý đơn vị tổ chức"}'),

(5007, NULL, 3,
 'Hướng dẫn phân quyền: Vào Quản trị → Phân quyền (/admin/permissions). Xem danh sách nhóm quyền (ADMIN, MANAGER, USER). Nhấn vào nhóm để xem chi tiết các quyền hạn. Admin có thể cấu hình lại từng quyền: Xem, Tạo, Sửa, Xóa, Phê duyệt.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Cấu hình phân quyền nhóm"}'),

(5007, NULL, 4,
 'Hướng dẫn quản lý loại văn bản: Vào Quản trị → Loại văn bản (/admin/document-types). Hệ thống có sẵn 5 loại: Công văn, Biên bản, Đề xuất, Quyết định, Thông báo nội bộ. Có thể thêm loại mới: điền mã, tên, mô tả. Nhấn "Lưu".',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Quản lý loại văn bản"}'),

(5007, NULL, 5,
 'Hướng dẫn quản lý mẫu văn bản: Vào Quản trị → Mẫu văn bản (/admin/templates). Xem danh sách template có sẵn. Nhấn "+ Thêm mẫu": chọn loại văn bản, đặt tên mẫu, soạn nội dung mẫu theo định dạng. Người dùng khi tạo văn bản mới có thể chọn template để điền nhanh.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Quản lý mẫu văn bản"}'),

(5007, NULL, 6,
 'Hướng dẫn quản lý quy trình xử lý: Vào Quản trị → Quy trình xử lý (/admin/workflows). Xem danh sách quy trình hiện có. Nhấn vào một quy trình để xem chi tiết các bước. Nhấn "+ Thêm quy trình" để tạo mới: đặt mã, tên, chọn loại văn bản áp dụng. Sau đó thêm từng bước xử lý.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Quản lý quy trình xử lý"}'),

(5007, NULL, 7,
 'Hướng dẫn xem và chỉnh sửa cấu hình SLA: Vào Quản trị → Quản lý SLA (/admin/sla). Chọn quy trình từ dropdown. Bảng hiển thị từng bước với thời gian xử lý hiện tại. Nhấn "Chỉnh sửa" ở một bước, sửa thời gian (số) và đơn vị (Phút/Giờ/Ngày), nhấn "Lưu".',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Cấu hình SLA quy trình"}'),

(5007, NULL, 8,
 'Hướng dẫn xem vi phạm SLA: Tại trang /admin/sla, nhấn tab "Vi phạm SLA". Hệ thống hiển thị danh sách văn bản đã quá hạn xử lý ở từng bước, kèm tên bước vi phạm và số ngày trễ. Màu đỏ đánh dấu vi phạm nghiêm trọng.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "quan_tri", "title": "Xem vi phạm SLA"}'),

-- ============================================================
-- NHÓM 10: BÁO CÁO & THỐNG KÊ
-- van_ban_id = 5014 (QĐ khen thưởng)
-- ============================================================

(5014, NULL, 0,
 'Hướng dẫn xem báo cáo thống kê: Vào Quản trị → Thống kê & Báo cáo (/admin/reports). Trang hiển thị các thẻ tổng quan: Tổng văn bản, Văn bản đến, Văn bản đi, Đã xử lý, Đang xử lý, Quá hạn, Tỉ lệ hoàn thành. Phía dưới có biểu đồ và bảng tiến độ quy trình.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "bao_cao", "title": "Xem tổng quan báo cáo thống kê"}'),

(5014, NULL, 1,
 'Hướng dẫn lọc báo cáo theo thời gian: Tại trang /admin/reports, chọn "Từ ngày" và "Đến ngày" trong bộ lọc ở đầu trang. Nhấn "Lọc". Tất cả số liệu và biểu đồ cập nhật theo khoảng thời gian đã chọn. Nhấn "Xóa lọc" để về mặc định.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "bao_cao", "title": "Lọc báo cáo theo thời gian"}'),

(5014, NULL, 2,
 'Hướng dẫn xuất báo cáo: Tại trang /admin/reports, nhấn "Xuất CSV" để tải file CSV về máy — mở được bằng Excel. Nhấn "Xuất Excel" để tải file XLSX. Nhấn "Xuất PDF" để tải file PDF. File báo cáo bao gồm tất cả chỉ số thống kê hiện tại trên trang.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "bao_cao", "title": "Xuất báo cáo CSV Excel PDF"}'),

(5014, NULL, 3,
 'Ý nghĩa các chỉ số báo cáo: Tổng văn bản - tổng số văn bản trong hệ thống theo bộ lọc thời gian; Đã xử lý - số văn bản có trạng thái Đã ký hoặc Đã phát hành; Đang xử lý - số văn bản đang trong quy trình; Quá hạn - số văn bản chưa xử lý xong mà đã quá hạn; Tỉ lệ hoàn thành - phần trăm nhiệm vụ hoàn thành so với tổng.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "bao_cao", "title": "Ý nghĩa các chỉ số báo cáo"}'),

-- ============================================================
-- NHÓM 11: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG)
-- van_ban_id = 5005 (CV hội nghị tổng kết)
-- ============================================================

(5005, NULL, 0,
 'Hướng dẫn xem nhật ký hoạt động: Vào Quản trị → Nhật ký hoạt động (/admin/audit-logs). Danh sách hiển thị toàn bộ thao tác trong hệ thống: đăng nhập, tạo văn bản, phê duyệt, chuyển xử lý, phân quyền... kèm người thực hiện, thời gian, địa chỉ IP.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "audit_log", "title": "Xem nhật ký hoạt động"}'),

(5005, NULL, 1,
 'Lọc nhật ký hoạt động: Tại trang /admin/audit-logs, có thể lọc theo người dùng (chọn từ dropdown), theo loại hành động (Đăng nhập, Tạo văn bản, Phê duyệt, v.v.), theo khoảng thời gian. Nhật ký giúp kiểm soát toàn bộ hoạt động và phát hiện thao tác bất thường.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "audit_log", "title": "Lọc nhật ký theo điều kiện"}'),

-- ============================================================
-- NHÓM 12: GIÁM SÁT HỆ THỐNG
-- van_ban_id = 5008 (Biên bản họp BGD)
-- ============================================================

(5008, NULL, 0,
 'Hướng dẫn xem trạng thái hệ thống: Vào Quản trị → Giám sát hệ thống (/admin/monitoring). Trang hiển thị trạng thái Up/Down của từng microservice: Auth Service, Document Service, Workflow Service, AI Service, Notification Service. Màu xanh = đang chạy, màu đỏ = lỗi.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "giam_sat", "title": "Giám sát trạng thái dịch vụ"}'),

(5008, NULL, 1,
 'Các thành phần hệ thống QLDA: Auth Service (cổng 8081) - xác thực và quản lý người dùng; Document Service (8082) - quản lý văn bản và file; Workflow Service (8083) - quy trình và phê duyệt; AI Service (8084) - tóm tắt, phân loại, chatbot; Notification Service (8085) - thông báo và báo cáo; API Gateway (8080) - điểm vào chung.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "giam_sat", "title": "Kiến trúc các dịch vụ hệ thống"}'),

-- ============================================================
-- NHÓM 13: AI CHATBOT & TÍNH NĂNG AI
-- van_ban_id = 5002 (CV hướng dẫn kế hoạch đầu tư)
-- ============================================================

(5002, NULL, 0,
 'Hướng dẫn sử dụng AI Chatbot: Nhấn vào icon 💬 ở góc dưới phải màn hình để mở hộp chat. Gõ câu hỏi bằng tiếng Việt, nhấn Enter hoặc nút Gửi. AI trả lời trong vòng vài giây. Có thể hỏi về: quy trình xử lý, cách sử dụng tính năng, tra cứu văn bản, giải thích thuật ngữ.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "ai_chatbot", "title": "Sử dụng AI Chatbot"}'),

(5002, NULL, 1,
 'AI Chatbot có thể trả lời các câu hỏi: "Làm thế nào để tạo công văn mới?", "Quy trình phê duyệt gồm mấy bước?", "Văn bản thượng khẩn cần xử lý trong bao lâu?", "Tôi muốn tìm văn bản về kinh phí quý 2", "Hướng dẫn ủy quyền khi đi công tác". AI không hỗ trợ các câu hỏi ngoài phạm vi quản lý văn bản.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "ai_chatbot", "title": "Phạm vi hỗ trợ của AI Chatbot"}'),

(5002, NULL, 2,
 'Tính năng AI tóm tắt văn bản: Hệ thống AI có thể tự động tóm tắt nội dung văn bản dài thành các điểm chính. Kết quả tóm tắt lưu trong bảng KetQuaAI với độ tin cậy (0-1). Sử dụng mô hình Gemini 1.5 Flash của Google.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "ai_tinh_nang", "title": "AI tóm tắt văn bản tự động"}'),

(5002, NULL, 3,
 'Tính năng AI phân loại văn bản: AI tự động nhận diện loại văn bản (Công văn, Biên bản, Đề xuất, Quyết định), mức độ khẩn cấp và gán thẻ chủ đề (tags). Độ chính xác trung bình 90-97%. Kết quả gợi ý cho người dùng, không tự động thay đổi dữ liệu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "ai_tinh_nang", "title": "AI phân loại văn bản tự động"}'),

-- ============================================================
-- NHÓM 14: CÂU HỎI THƯỜNG GẶP (FAQ)
-- van_ban_id = 5003 (Biên bản nghiệm thu)
-- ============================================================

(5003, NULL, 0,
 'Câu hỏi thường gặp: Tôi không đăng nhập được vào hệ thống. Trả lời: Kiểm tra email đăng nhập phải là tài khoản @sv1.dut.udn.vn. Đảm bảo Docker đang chạy (kiểm tra tại localhost:8761). Thử xóa cache trình duyệt (F12 → Application → Clear site data) rồi đăng nhập lại.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "su_co", "title": "Lỗi không đăng nhập được"}'),

(5003, NULL, 1,
 'Câu hỏi thường gặp: Trang báo lỗi 401 Unauthorized sau khi đăng nhập. Trả lời: Token đăng nhập đã hết hạn. Cách xử lý: Đăng xuất (click tên người dùng → Đăng xuất) rồi đăng nhập lại. Nếu vẫn lỗi, xóa dữ liệu phiên trình duyệt và thử lại.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "su_co", "title": "Lỗi 401 Unauthorized"}'),

(5003, NULL, 2,
 'Câu hỏi thường gặp: Văn bản tôi tạo không thấy trong danh sách. Trả lời: Kiểm tra bộ lọc trạng thái — có thể bộ lọc đang ẩn văn bản nháp. Nhấn "Xóa lọc" để hiện tất cả. Nếu vẫn không thấy, có thể văn bản chưa được lưu — kiểm tra lại.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "su_co", "title": "Không thấy văn bản trong danh sách"}'),

(5003, NULL, 3,
 'Câu hỏi thường gặp: Upload file thất bại. Trả lời: Kiểm tra định dạng file — hệ thống chấp nhận PDF, DOCX, XLSX. Kích thước file tối đa 10MB. Không dùng ký tự đặc biệt trong tên file. Thử đổi tên file sang tiếng Việt không dấu hoặc tiếng Anh.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "su_co", "title": "Upload file thất bại"}'),

(5003, NULL, 4,
 'Câu hỏi thường gặp: Tôi không thấy mục Quản trị ở sidebar. Trả lời: Mục Quản trị chỉ hiện với tài khoản có vai trò ADMIN. Nếu bạn là Chuyên viên (USER) hoặc Trưởng phòng (MANAGER), không thể vào các trang /admin/*. Liên hệ Admin để được cấp quyền nếu cần.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "phan_quyen", "title": "Không thấy mục Quản trị"}'),

(5003, NULL, 5,
 'Câu hỏi thường gặp: AI Chatbot không trả lời được. Trả lời: Chatbot cần kết nối với AI Service (cổng 8084) và Gemini API key. Kiểm tra tại localhost:8761 xem ai-service có Up không. Nếu dịch vụ Down, liên hệ Admin. Nếu hỏi nội dung ngoài phạm vi QLDA, chatbot sẽ từ chối trả lời.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "su_co", "title": "AI Chatbot không trả lời"}'),

(5003, NULL, 6,
 'Câu hỏi thường gặp: Tôi muốn xem lịch sử các bước xử lý của một văn bản. Trả lời: Mở chi tiết văn bản (nhấn vào tên văn bản trong danh sách). Cuộn xuống phần "Lịch sử xử lý" hoặc "Timeline". Hiển thị từng bước: ai gửi, ai nhận, hành động, ý kiến, thời gian.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "van_ban", "title": "Xem lịch sử xử lý văn bản"}'),

(5003, NULL, 7,
 'Câu hỏi thường gặp: Tôi muốn in hoặc tải văn bản về máy. Trả lời: Tại trang chi tiết văn bản, tìm mục "File đính kèm". Nhấn vào tên file để tải về. Nếu file lưu trên SharePoint/OneDrive, hệ thống sẽ mở liên kết tải trực tiếp.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "faq", "topic": "van_ban", "title": "Tải văn bản về máy"}'),

-- ============================================================
-- NHÓM 15: DASHBOARD & TỔNG QUAN
-- van_ban_id = 5009 (CV quy hoạch đất)
-- ============================================================

(5009, NULL, 0,
 'Hướng dẫn xem Dashboard: Vào trang /dashboard sau khi đăng nhập. Dashboard hiển thị tổng quan: số văn bản đến hôm nay, số văn bản chờ xử lý, số văn bản quá hạn, số phê duyệt đang chờ. Nhấn vào từng thẻ để chuyển sang trang chi tiết tương ứng.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "dashboard", "title": "Xem tổng quan Dashboard"}'),

(5009, NULL, 1,
 'Hướng dẫn xem Dashboard Admin: Admin truy cập /admin/dashboard để xem thống kê toàn hệ thống: tổng người dùng, tổng văn bản, trạng thái dịch vụ, biểu đồ hoạt động. Trang này chỉ dành riêng cho vai trò ADMIN.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "topic": "dashboard", "title": "Dashboard quản trị Admin"}'),

-- ============================================================
-- NHÓM 16: THUẬT NGỮ & GIẢI THÍCH
-- van_ban_id = 5010 (CV thượng khẩn ATTT)
-- ============================================================

(5010, NULL, 0,
 'Giải thích thuật ngữ: SLA (Service Level Agreement) là thỏa thuận về thời hạn xử lý văn bản theo từng bước quy trình. Ví dụ SLA của bước "Chuyên viên xử lý" là 48 giờ có nghĩa: sau khi nhận, chuyên viên phải xử lý xong trong 48 giờ. Vượt quá sẽ tính là vi phạm SLA.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thuat_ngu", "title": "Giải thích SLA"}'),

(5010, NULL, 1,
 'Giải thích thuật ngữ: Azure SSO (Single Sign-On) là cơ chế đăng nhập một lần qua tài khoản Microsoft của tổ chức. Người dùng không cần tài khoản riêng cho hệ thống QLDA — chỉ cần tài khoản email @sv1.dut.udn.vn đã được cấp phép là có thể đăng nhập.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thuat_ngu", "title": "Giải thích Azure SSO"}'),

(5010, NULL, 2,
 'Giải thích thuật ngữ: Vector Search (tìm kiếm vector) là công nghệ AI tìm kiếm ngữ nghĩa, cho phép tìm văn bản dựa trên ý nghĩa nội dung thay vì khớp từ khóa chính xác. Ví dụ tìm "kinh phí" sẽ tìm được cả văn bản có từ "ngân sách", "tài chính".',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thuat_ngu", "title": "Giải thích Vector Search AI"}'),

(5010, NULL, 3,
 'Giải thích thuật ngữ: Microservice là kiến trúc hệ thống gồm nhiều dịch vụ nhỏ độc lập, mỗi dịch vụ đảm nhận một chức năng riêng. QLDA có 5 microservice chính: Auth, Document, Workflow, AI, Notification. Các dịch vụ giao tiếp qua API Gateway và Kafka message broker.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thuat_ngu", "title": "Giải thích kiến trúc Microservice"}'),

(5010, NULL, 4,
 'Giải thích thuật ngữ: Audit Log (Nhật ký kiểm toán) là bản ghi tự động mọi thao tác trong hệ thống: ai làm gì, lúc nào, từ IP nào. Không thể xóa hoặc sửa audit log. Dùng để kiểm tra trách nhiệm, phát hiện thao tác bất thường và tuân thủ quy định bảo mật.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_tin", "topic": "thuat_ngu", "title": "Giải thích Audit Log"}');
