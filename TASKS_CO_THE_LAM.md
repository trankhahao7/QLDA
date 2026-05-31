# Danh sách việc CÓ THỂ LÀM

> Cập nhật: 2026-05-31
> Mục đích: Tổng hợp những gì **có thể làm tiếp** dựa trên credentials đã có trong `.env`.

---

## ✅ CÓ THỂ LÀM — Phân loại theo nhóm

---

### Nhóm A — Code thuần Frontend/Backend (không cần external service)

> Không phụ thuộc Azure, email, hay bất kỳ credential nào. Làm được ngay.

| # | Việc cần làm | File cần sửa / tạo | Độ khó | Ghi chú |
|---|---|---|---|---|
| A1 | **Trang Văn bản nội bộ** | Tạo `frontend/src/routes/user/InternalDocuments.tsx`, thêm route App.tsx, thêm Sidebar link | Trung bình | Backend `InternalDocumentController` đã có đầy đủ endpoints. Trang này hiện thiếu hoàn toàn. |
| A2 | **Click thông báo → navigate đến văn bản** | `frontend/src/routes/user/Notifications.tsx` | Dễ | Khi click 1 thông báo, cần navigate đến `/documents/{id}` hoặc `/approvals` tương ứng. Hiện tại chỉ mark đã đọc, không redirect. |
| A3 | **SLA warning list** — văn bản sắp hết hạn | `frontend/src/routes/admin/SlaManagement.tsx` | Trung bình | Thêm section hiển thị danh sách văn bản còn ≤ 2 ngày SLA. Gọi API `GET /api/workflows/approvals/pending` lọc theo `hanXuLy`. |
| A4 | **Timeline xử lý của hồ sơ** | `frontend/src/routes/user/CaseFiles.tsx` | Trung bình | Thêm modal/panel hiển thị lịch sử xử lý khi click vào 1 hồ sơ. Gọi `workflowTrackingApi`. |
| A5 | **Top nhân viên xử lý nhiều nhất** | `frontend/src/routes/admin/Reports.tsx` | Dễ | Thêm bảng thống kê. Backend `ReportController` có thể đã có endpoint hoặc cần thêm. |
| A6 | **Ủy quyền hết hạn tự động** | `notification-service/.../scheduler/` hoặc `workflow-service` | Dễ | Thêm `@Scheduled` cron job kiểm tra `den_ngay < NOW()` → set `active = false`. |
| A7 | **Upload file đính kèm từ trang Văn bản đi** | `frontend/src/routes/user/OutgoingDocuments.tsx` | Dễ | Thêm file input trong form tạo văn bản đi. Gọi `AttachmentController`. |
| A8 | **Sidebar "Trạng thái kết nối" dynamic** | `frontend/src/shared/Sidebar.tsx` | Dễ | Hiện đang hardcode "Đang đồng bộ Office 365. Cập nhật lúc 09:20." Nên xóa card này hoặc thay bằng thông tin thật. |
| A9 | **ai-service actuator health** | `qlda-system/ai-service/pom.xml` + `application.yml` | Dễ | Thêm `spring-boot-starter-actuator` dependency và expose `/actuator/health`. Hiện trả 404. |
| A10 | **Phân loại tự động khi upload văn bản** | `document-service` → gọi `ai-service` sau khi tạo VanBan | Trung bình | Sau khi `createIncoming()`, gọi Feign client đến `POST /api/ai/classify` tự động. Lưu kết quả vào `KetQuaAI`. |
| A11 | **Vitest unit tests cho frontend services** | `frontend/src/test/` | Trung bình | Các service API (`documentsApi`, `workflowsApi`, `authApi`) chưa có test. Cần mock `apiClient`. |

---

### Nhóm B — Credentials đã có trong `.env`, chỉ cần kích hoạt / verify

| # | Việc cần làm | Credentials đã có | Cần làm thêm |
|---|---|---|---|
| B1 | **Email notification hoạt động** | `SPRING_MAIL_HOST`, `PORT`, `USERNAME`, `PASSWORD` đã set | Rebuild notification-service. Test bằng cách trigger 1 workflow approval → kiểm tra email `102230222@sv1.dut.udn.vn` có nhận được không. |
| B2 | **Teams notification hoạt động** | `TEAMS_WEBHOOK_URL` đã set (Power Automate webhook) | Rebuild notification-service. Test bằng cách trigger SLA overdue → kiểm tra Teams channel có nhận message không. |
| B3 | **Azure AD SSO hoạt động** | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` đã set | Verify trong Azure Portal: redirect URI `http://localhost:5173` đã thêm chưa. Nếu rồi thì SSO nên hoạt động. Login.tsx có PKCE flow đầy đủ. |
| B4 | **AI features hoạt động đầy đủ** | `GEMINI_API_KEY` đã set | Test từng tính năng trong DocumentDetail: Tóm tắt, Phân loại, Gợi ý xử lý, Trích xuất metadata. Chatbot RAG cần pgvector có data. |
| B5 | **Nạp data vào pgvector cho Chatbot RAG** | Gemini API key có | Chạy `seed_chunks.sql` hoặc gọi `POST /api/ai/index` để index một số văn bản vào pgvector. Chatbot hiện có thể trả lời rỗng vì không có data. |

---

## Thứ tự ưu tiên đề xuất

```
Làm ngay (tác động lớn nhất):
  1. B3 — Verify Azure SSO  →  login được thì test được toàn bộ
  2. A1 — Trang Văn bản nội bộ  →  chức năng còn thiếu hoàn toàn
  3. B4/B5 — Verify AI + nạp data pgvector cho Chatbot

Làm sau:
  4. B1 — Test Email notification
  5. B2 — Test Teams notification
  6. A2 — Click thông báo navigate
  7. A3 — SLA warning list
  8. A6 — Ủy quyền hết hạn auto
  9. A10 — Auto-classify khi upload

Thấp ưu tiên (polish):
  10. A4 — Timeline hồ sơ
  11. A5 — Top nhân viên Reports
  12. A7 — Upload đính kèm từ OutgoingDocuments
  13. A8 — Sidebar status dynamic
  14. A9 — ai-service actuator health
  15. A11 — Vitest unit tests
```

---

## Ghi chú kỹ thuật

- `SHAREPOINT_ENABLED=false` → `SharePointService` bean không được tạo (conditional) → `getOneDriveEditUrl()` luôn trả `null`. Không ảnh hưởng các chức năng khác.
- Gemini API key format `AQ.Ab8R...` — cần verify lại key còn hiệu lực không bằng cách chạy thử 1 AI request trong DocumentDetail.
- `TEAMS_WEBHOOK_URL` là Power Automate URL (không phải Teams Incoming Webhook truyền thống) — cần đảm bảo flow Power Automate đang ở trạng thái **On** trong Power Automate portal.
- `DevAuthController` (`/api/auth/login/dev`) chỉ dùng để test backend trực tiếp qua curl/Postman — không cần expose trên FE.
