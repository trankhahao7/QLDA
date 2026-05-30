# Kế hoạch triển khai: Hệ thống eOIS (eOffice Intelligence System)

> Dự án: Xây dựng hệ thống xử lý văn bản điện tử tích hợp Office 365  
> Đơn vị: Công ty TNHH ABC — Đà Nẵng  
> Cập nhật: 2026-05-30  
> Trạng thái: Giai đoạn 1 (MVP) hoàn thành ~70% — đang chuẩn bị Giai đoạn 2

---

## Mục lục

- [Hiện trạng hệ thống](#1-hiện-trạng-hệ-thống)
- [Gap Analysis — 43 chức năng](#2-gap-analysis)
- [Phase 1 — Audit & Kiểm tra thực tế](#phase-1--audit--kiểm-tra-thực-tế-12-ngày)
- [Phase 2 — Hoàn thiện Frontend](#phase-2--hoàn-thiện-frontend-35-ngày)
- [Phase 3 — Azure AD SSO & Office 365 Core](#phase-3--azure-ad-sso--office-365-core-57-ngày)
- [Phase 4 — OneDrive & Ký số điện tử](#phase-4--onedrive--ký-số-điện-tử-34-ngày)
- [Phase 5 — Backend bổ sung & SLA Scheduler](#phase-5--backend-bổ-sung--sla-scheduler-23-ngày)
- [Phase 6 — Testing & Security](#phase-6--testing--security-23-ngày)
- [Phụ thuộc kỹ thuật](#phụ-thuộc-kỹ-thuật)
- [Rủi ro](#rủi-ro)
- [Tổng hợp tiến độ](#tổng-hợp-tiến-độ)

---

## 1. Hiện trạng hệ thống

### Backend — 6 Microservices (~390 file Java)

| Service | Công nghệ | Chức năng đã có |
|---|---|---|
| `api-gateway` | Spring Cloud Gateway | Routing, JWT validation |
| `service-registry` | Eureka | Service discovery |
| `auth-service` | Spring Boot + JWT | Quản lý user, phân quyền, DonVi, AuditLog, Backup, Office365 (skeleton), SecurityPolicy |
| `document-service` | Spring Boot | Văn bản đến/đi/nội bộ, OCR, Draft, Attachment, CaseFile, Version, Numbering, Publication |
| `workflow-service` | Spring Boot | QuyTrinh, BuocQuyTrinh, XuLyVanBan, SLA |
| `ai-service` | Spring Boot + pgvector | AiController, ChatbotController, RAG (AiDocumentChunk), tóm tắt, phân loại |
| `notification-service` | Spring Boot + Kafka | Thông báo, Report, AuditLog, Kafka events |

**Infrastructure:** PostgreSQL 17 (pgvector), Apache Kafka, Docker Compose

### Frontend — React 18 / Vite / TypeScript

| Loại | Trang / Component |
|---|---|
| Admin routes | Dashboard, AuditLogs, DocumentTypes, PermissionManagement, SystemMonitoring, TemplateManagement, UnitManagement, UserManagement, WorkflowManagement |
| User routes | Dashboard, DocumentDetail, Inbox, Login, Profile, Search, Upload |
| Services | ai, auth, core, documents, notifications, reports, sla, units, workflows |
| Shared | ChatBot, Sidebar, AppShell, AdminShell, AdminSidebar |

---

## 2. Gap Analysis

### Trạng thái 43 chức năng theo tài liệu KTKT

| # | Chức năng | Trạng thái | Ghi chú |
|---|---|---|---|
| **Nhóm I — Quản trị, bảo mật & hạ tầng** | | | |
| 1 | Quản lý người dùng, phân quyền theo vai trò | ✅ Done | UserController, NhomQuyenController |
| 2 | Tích hợp Azure Active Directory (SSO) | 🔶 Partial | Office365Controller skeleton — chưa OAuth flow |
| 3 | Ghi log hệ thống, Audit trail | ✅ Done | AuditLogController (auth + notification) |
| 4 | Sao lưu và phục hồi dữ liệu | 🔶 Partial | BackupController tồn tại — chưa rõ schedule |
| 5 | Cấu hình môi trường Office 365 | 🔶 Partial | Cần hoàn thiện ở Phase 3 |
| 6 | Chính sách bảo mật, kiểm soát truy cập | 🔶 Partial | SecurityPolicyController — chưa rõ đầy đủ |
| 7 | Quản lý cấu hình hệ thống | ✅ Done | SystemController |
| **Nhóm II — Nghiệp vụ văn bản & số hóa** | | | |
| 8 | Tiếp nhận và quản lý văn bản đến | ✅ Done | IncomingDocumentController |
| 9 | Số hóa tài liệu qua OCR | 🔶 Partial | OcrController có — engine chưa xác nhận |
| 10 | Soạn thảo văn bản điện tử | ✅ Done | DraftController |
| 11 | Quản lý mẫu văn bản (Template) | ✅ Done | Backend + TemplateManagement.tsx |
| 12 | Phát hành văn bản điện tử | ✅ Done | PublicationController |
| 13 | Quản lý văn bản đi | 🔶 Partial | OutgoingDocumentController có — thiếu UI |
| 14 | Đánh số văn bản tự động | ✅ Done | NumberingController |
| 15 | Quản lý hồ sơ công việc | 🔶 Partial | CaseFileController có — thiếu UI |
| 16 | Phân loại và lập danh mục hồ sơ | 🔶 Partial | Cần AI tự động gán loại |
| 17 | Quản lý phiên bản văn bản | ✅ Done | DocumentVersionController |
| **Nhóm III — Luồng công việc & xử lý liên thông** | | | |
| 18 | Thiết kế và cấu hình quy trình (Workflow) | ✅ Done | WorkflowController, WorkflowManagement.tsx |
| 19 | Phê duyệt văn bản nhiều cấp | 🔶 Partial | Backend có — thiếu UI approval queue |
| 20 | Ủy quyền xử lý | ❌ Missing | Chưa có |
| 21 | Theo dõi tiến độ xử lý | ✅ Done | workflow-service |
| 22 | Nhắc việc, đôn đốc tự động | ✅ Done | notification-service + Kafka |
| 23 | Luân chuyển văn bản giữa phòng ban | ✅ Done | XuLyVanBan workflow |
| 24 | Thiết lập SLA xử lý văn bản | 🔶 Partial | Service có — thiếu cron scheduler + UI |
| 25 | Thông báo hệ thống | 🔶 Partial | Backend có — thiếu UI trang thông báo |
| **Nhóm IV — AI Agent & Trợ lý ảo** | | | |
| 26 | Tóm tắt nội dung văn bản tự động | ✅ Done | AiController |
| 27 | Phân loại văn bản | ✅ Done | AiController |
| 28 | Trích xuất dữ liệu (Metadata Extraction) | ✅ Done | AiController |
| 29 | Hỗ trợ tìm kiếm thông minh | ✅ Done | Search.tsx + ai-service RAG |
| 30 | Gợi ý xử lý và phản hồi | ✅ Done | AiController |
| 31 | Chatbot hỗ trợ người dùng | ✅ Done | ChatbotController + ChatBot.tsx |
| **Nhóm V — Hệ sinh thái Office 365 & Lưu trữ số** | | | |
| 32 | Tích hợp SharePoint lưu trữ tài liệu | ❌ Missing | Chưa có |
| 33 | Tích hợp OneDrive chỉnh sửa văn bản | ❌ Missing | Chưa có |
| 34 | Tích hợp Microsoft Teams thông báo | ❌ Missing | Chưa có |
| 35 | Tích hợp Outlook gửi email tự động | ❌ Missing | Chưa có |
| 36 | Quản lý kho lưu trữ hồ sơ điện tử dài hạn | ❌ Missing | Cần sau khi có SharePoint |
| 37 | Ký số văn bản điện tử | ❌ Missing | Chưa có |
| **Nhóm VI — Quản lý dự án, kiểm thử & vận hành** | | | |
| 38 | Lập kế hoạch và quản lý tiến độ dự án | ❌ Missing | Ngoài scope phần mềm |
| 39 | Kiểm thử hệ thống (UAT, bảo mật) | ❌ Missing | Phase 6 |
| 40 | Xây dựng dashboard báo cáo | 🔶 Partial | AdminDashboard.tsx có — cần thêm charts |
| 41 | Thống kê, phân tích dữ liệu sử dụng | 🔶 Partial | reports service có — thiếu UI đầy đủ |
| 42 | Đào tạo người dùng và quản trị hệ thống | ❌ Missing | Ngoài scope phần mềm |
| 43 | Azure AD, MFA, PIM | 🔶 Partial | Cần hoàn thiện ở Phase 3 |

**Tổng kết:** ✅ 17 done | 🔶 16 partial | ❌ 10 missing

---

## Phase 1 — Audit & Kiểm tra thực tế (1–2 ngày)

> **Mục tiêu:** Xác nhận API nào đang hoạt động thật vs còn stub. Tạo bảng trạng thái chính xác trước khi làm tiếp.

### Checklist

#### 1.1 Khởi động & Health Check
- [ ] Chạy `docker-compose up --build` toàn bộ stack
- [ ] Xác nhận tất cả 6 service healthy trên Eureka dashboard
- [ ] Kiểm tra kết nối PostgreSQL, Kafka đang hoạt động

#### 1.2 Kiểm tra từng service

**auth-service:**
- [ ] `POST /api/auth/login` — trả JWT hợp lệ
- [ ] `GET /api/users` — phân trang đúng
- [ ] `POST /api/users` — tạo user với role
- [ ] `GET /api/nhom-quyen` — liệt kê nhóm quyền
- [ ] `GET /api/office365/auth-url` — có trả OAuth URL không?

**document-service:**
- [ ] `POST /api/incoming-documents` — upload văn bản đến
- [ ] `POST /api/ocr` — test với file PDF/image thật
- [ ] `POST /api/drafts` — tạo bản thảo
- [ ] `GET /api/case-files` — liệt kê hồ sơ

**workflow-service:**
- [ ] `POST /api/workflows` — tạo quy trình mới
- [ ] `POST /api/workflows/{id}/steps` — thêm bước duyệt
- [ ] `PUT /api/xu-ly-van-ban/{id}/approve` — phê duyệt

**ai-service:**
- [ ] `POST /api/ai/summarize` — tóm tắt văn bản
- [ ] `POST /api/chatbot/chat` — chatbot RAG trả lời đúng
- [ ] Xác nhận pgvector đang có data chunks

**notification-service:**
- [ ] `GET /api/notifications` — liệt kê thông báo
- [ ] Kafka consumer đang nhận event từ các service khác

#### 1.3 Output Phase 1
- [ ] Cập nhật bảng Gap Analysis ở trên với trạng thái thực tế
- [ ] Ghi lại danh sách API trả lỗi hoặc chưa implement
- [ ] Tạo file `AUDIT_RESULTS.md` với kết quả chi tiết

---

## Phase 2 — Hoàn thiện Frontend (3–5 ngày)

> **Mục tiêu:** Bổ sung các trang UI còn thiếu để người dùng có thể dùng đầy đủ nghiệp vụ văn bản.

### 2.1 Trang Văn bản đi (`/user/outgoing`)

**File:** `frontend/src/routes/user/OutgoingDocuments.tsx`

- [ ] Danh sách văn bản đi với filter (trạng thái, ngày, loại)
- [ ] Form tạo văn bản đi mới (số hiệu, ngày, nơi nhận, nội dung)
- [ ] Xem chi tiết, tải file đính kèm
- [ ] Trạng thái: Nháp → Chờ duyệt → Đã phát hành
- [ ] Kết nối `documents service` (`OutgoingDocumentController`)

### 2.2 Trang Hồ sơ công việc (`/user/case-files`)

**File:** `frontend/src/routes/user/CaseFiles.tsx`

- [ ] Danh sách hồ sơ công việc (grid/list view)
- [ ] Tạo hồ sơ mới, gắn văn bản liên quan
- [ ] Xem timeline xử lý của hồ sơ
- [ ] Upload/xem tài liệu đính kèm theo hồ sơ
- [ ] Kết nối `CaseFileController`

### 2.3 Trang Phê duyệt (`/user/approvals`)

**File:** `frontend/src/routes/user/Approvals.tsx`

- [ ] Queue văn bản chờ mình duyệt (badge count trên sidebar)
- [ ] Action: Phê duyệt / Từ chối / Yêu cầu bổ sung
- [ ] Xem lịch sử duyệt nhiều cấp (audit trail của workflow)
- [ ] Comment/ghi chú khi duyệt hoặc từ chối
- [ ] Kết nối `WorkflowController` + `XuLyVanBan`

### 2.4 Trang Thông báo (`/user/notifications`)

**File:** `frontend/src/routes/user/Notifications.tsx`

- [ ] Danh sách thông báo với phân trang
- [ ] Filter: Chưa đọc / Tất cả / Theo loại (nhắc việc, phê duyệt, hệ thống)
- [ ] Đánh dấu đã đọc đơn lẻ và đánh dấu tất cả
- [ ] Click thông báo → navigate đến tài nguyên liên quan
- [ ] Badge số thông báo chưa đọc trên Sidebar
- [ ] Kết nối `NotificationController`

### 2.5 Trang Báo cáo & Thống kê (`/admin/reports`)

**File:** `frontend/src/routes/admin/Reports.tsx`

- [ ] Chart: Số văn bản đến/đi theo tháng (line chart)
- [ ] Chart: Tỉ lệ xử lý đúng hạn vs quá hạn (donut chart)
- [ ] Bảng: Top nhân viên xử lý nhiều nhất
- [ ] Bảng: Văn bản quá hạn chưa xử lý
- [ ] Export báo cáo ra Excel/PDF
- [ ] Kết nối `ReportController`

### 2.6 Trang Quản lý SLA (`/admin/sla`)

**File:** `frontend/src/routes/admin/SlaManagement.tsx`

- [ ] Danh sách cấu hình SLA theo loại văn bản
- [ ] Tạo/sửa SLA: loại văn bản, số ngày xử lý, cảnh báo trước N ngày
- [ ] Dashboard: văn bản đang sắp hết SLA (warning list)
- [ ] Kết nối `sla service`

### 2.7 Cập nhật routing & Sidebar

- [ ] Thêm routes mới vào `App.tsx`
- [ ] Thêm menu items vào `Sidebar.tsx` (user) và `AdminSidebar.tsx` (admin)
- [ ] Bảo vệ route bằng role-based access (kiểm tra quyền trước khi render)

---

## Phase 3 — Azure AD SSO & Office 365 Core (5–7 ngày)

> **Mục tiêu:** Tích hợp Microsoft 365 — tính năng đặc trưng nhất của dự án.  
> **Yêu cầu trước:** Azure App Registration với Client ID, Client Secret, Tenant ID.

### 3.1 Chuẩn bị Azure (DevOps / IT Admin)

- [ ] Tạo Azure App Registration trên Azure Portal
- [ ] Cấp API Permissions (delegated): `User.Read`, `Mail.Send`, `Files.ReadWrite`, `Sites.ReadWrite.All`, `ChannelMessage.Send`
- [ ] Bật admin consent cho tenant
- [ ] Lưu: `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`
- [ ] Thêm vào `.env` của auth-service (không commit lên git)

### 3.2 Hoàn thiện Azure AD SSO (auth-service)

**File:** `auth-service/.../controller/Office365Controller.java`

- [ ] Implement OAuth2 Authorization Code Flow với MSAL4J
- [ ] `GET /api/office365/auth-url` → trả redirect URL đến Microsoft login
- [ ] `GET /api/office365/callback` → nhận code, đổi lấy access token + refresh token
- [ ] Lưu Microsoft access token vào session/DB, map với user nội bộ
- [ ] Auto-tạo user nội bộ nếu đăng nhập Azure lần đầu (Just-In-Time provisioning)
- [ ] Cập nhật `AuthController` để hỗ trợ login flow từ Microsoft

**Frontend:**
- [ ] Thêm nút "Đăng nhập bằng Office 365" trên `Login.tsx`
- [ ] Xử lý redirect callback từ Microsoft
- [ ] Lưu JWT nội bộ sau khi SSO thành công

### 3.3 Tích hợp SharePoint (document-service)

**File mới:** `document-service/.../service/SharePointService.java`

- [ ] Sử dụng Microsoft Graph API: `POST /sites/{site-id}/drive/root:/path:/content`
- [ ] Khi phát hành văn bản (`PublicationController`): tự động upload lên SharePoint
- [ ] Lưu SharePoint file URL vào bảng `VanBan` (cột `sharepoint_url`)
- [ ] `GET /api/documents/{id}/sharepoint-link` → trả presigned link để mở file
- [ ] Sync metadata (tên file, ngày, người tạo) vào SharePoint column

### 3.4 Tích hợp Outlook Email (notification-service)

**File mới:** `notification-service/.../sender/OutlookEmailSender.java`

- [ ] Implement `NotificationDeliveryService` với Microsoft Graph: `POST /me/sendMail`
- [ ] Template email: nhắc việc, thông báo phê duyệt, quá hạn SLA
- [ ] Sử dụng service account (application permission: `Mail.Send`) để gửi thay mặt hệ thống
- [ ] Retry logic: nếu gửi thất bại → retry 3 lần → log lỗi
- [ ] Cấu hình qua `application.yml`: bật/tắt email notification

### 3.5 Tích hợp Microsoft Teams (notification-service)

**File mới:** `notification-service/.../sender/TeamsNotificationSender.java`

- [ ] Tạo Incoming Webhook hoặc dùng Graph API: `POST /teams/{team-id}/channels/{channel-id}/messages`
- [ ] Gửi adaptive card khi có văn bản mới cần xử lý
- [ ] Gửi nhắc nhở khi sắp hết SLA
- [ ] Cấu hình Teams channel ID per phòng ban trong bảng `DonVi`

---

## Phase 4 — OneDrive & Ký số điện tử (3–4 ngày)

### 4.1 Tích hợp OneDrive (document-service)

**File mới:** `document-service/.../service/OneDriveService.java`

- [ ] `GET /api/documents/{id}/onedrive-edit-url` → trả URL mở file trực tiếp trong Word Online
- [ ] Sử dụng Graph API: `GET /me/drive/items/{item-id}/createLink` với scope `edit`
- [ ] Sau khi user edit xong trên OneDrive → webhook callback → sync version mới về hệ thống
- [ ] Lưu lịch sử version (gắn với `DocumentVersionController`)

**Frontend:**
- [ ] Nút "Mở trong Word Online" trên `DocumentDetail.tsx`
- [ ] Hiển thị badge "Đang được chỉnh sửa" khi có user đang mở OneDrive

### 4.2 Ký số điện tử (document-service)

> Ưu tiên: Ký số từ xa (cloud-based CA) trước, USB token sau.

**File mới:** `document-service/.../service/DigitalSignatureService.java`

- [ ] Tích hợp API của CA provider (VNPT CA hoặc Viettel CA):
  - `POST /sign` — gửi hash file, nhận chữ ký số
  - Verify chữ ký khi người dùng tải về
- [ ] Lưu thông tin chữ ký vào bảng `ChuKySo` (signer, timestamp, cert serial, hash)
- [ ] `POST /api/documents/{id}/sign` — endpoint ký số
- [ ] `GET /api/documents/{id}/signature-info` — xem thông tin chữ ký
- [ ] Nhúng chữ ký vào file PDF (PDF/A với digital signature)

**Frontend:**
- [ ] Nút "Ký số" trên `DocumentDetail.tsx` (chỉ hiển thị với user có quyền)
- [ ] Modal xác nhận ký, hiển thị thông tin cert
- [ ] Badge "Đã ký số" với thông tin người ký, thời gian

### 4.3 Kho lưu trữ hồ sơ điện tử dài hạn

- [ ] Cấu hình SharePoint document library riêng cho lưu trữ dài hạn (retention policy)
- [ ] Tự động chuyển văn bản đã đóng sang thư viện lưu trữ sau N ngày
- [ ] API tra cứu văn bản lưu trữ với full-text search

---

## Phase 5 — Backend bổ sung & SLA Scheduler (2–3 ngày)

### 5.1 Ủy quyền xử lý (auth-service + workflow-service)

**File mới:** `auth-service/.../entity/UyQuyen.java`, `UyQuyenController.java`

Schema bảng `uy_quyen`:
```sql
CREATE TABLE uy_quyen (
    id          BIGSERIAL PRIMARY KEY,
    nguoi_uy    BIGINT REFERENCES nguoi_dung(id),
    nguoi_duoc  BIGINT REFERENCES nguoi_dung(id),
    tu_ngay     DATE NOT NULL,
    den_ngay    DATE NOT NULL,
    ghi_chu     TEXT,
    trang_thai  VARCHAR(20) DEFAULT 'ACTIVE'
);
```

- [ ] `POST /api/uy-quyen` — tạo ủy quyền với thời hạn
- [ ] `GET /api/uy-quyen/active` — ủy quyền đang hiệu lực
- [ ] Workflow service kiểm tra ủy quyền khi phân công xử lý
- [ ] Hết hạn ủy quyền: tự động set `trang_thai = EXPIRED`

**Frontend:**
- [ ] Trang ủy quyền trong `Profile.tsx` hoặc trang riêng `/user/delegation`

### 5.2 SLA Scheduler (notification-service)

**File mới:** `notification-service/.../scheduler/SlaScheduler.java`

- [ ] Cron job chạy mỗi ngày lúc 8:00 sáng
- [ ] Query tất cả văn bản chưa xử lý xong, tính số ngày còn lại so với SLA
- [ ] Nếu còn ≤ 2 ngày: gửi cảnh báo vàng (WARNING)
- [ ] Nếu đã quá hạn: gửi cảnh báo đỏ (OVERDUE) + push notification + email
- [ ] Publish Kafka event `SLA_WARNING` / `SLA_OVERDUE` → các service khác lắng nghe
- [ ] Lưu lịch sử cảnh báo SLA vào `lich_su_he_thong`

### 5.3 OCR Pipeline thực tế (document-service)

- [ ] Xác nhận OCR engine: Tesseract (local) hoặc Azure AI Vision (cloud)
- [ ] Nếu dùng Tesseract: thêm dependency `tess4j`, config ngôn ngữ `vie`
- [ ] Nếu dùng Azure Vision: gọi `POST /vision/v3.2/read/analyze`
- [ ] Tiền xử lý ảnh trước OCR: deskew, denoise, tăng contrast
- [ ] Test với 10 file PDF/image văn bản hành chính thật
- [ ] Lưu kết quả OCR text vào `VanBan.noi_dung_ocr` để full-text search

### 5.4 Phân loại hồ sơ tự động (ai-service)

- [ ] Khi upload văn bản mới → ai-service tự động gọi classify
- [ ] Trả về `loai_van_ban` gợi ý + confidence score
- [ ] User xác nhận hoặc override phân loại
- [ ] Lưu kết quả vào `KetQuaAI` với `loai = CLASSIFICATION`

---

## Phase 6 — Testing & Security (2–3 ngày)

### 6.1 Unit Testing

**Mục tiêu: 80% coverage trên các service nghiệp vụ**

- [ ] `auth-service`: test AuthController, UserService, JWT generation/validation
- [ ] `document-service`: test IncomingDocumentService, NumberingService
- [ ] `workflow-service`: test WorkflowService, SLA calculation logic
- [ ] `ai-service`: test AiApplicationService với mock LLM response
- [ ] `notification-service`: test SlaScheduler với mock data
- [ ] Frontend: Vitest unit test cho các service (auth, documents, workflows)

### 6.2 Integration Testing

- [ ] Luồng đầy đủ: Đăng nhập → Upload văn bản đến → Tạo workflow → Phê duyệt → Lưu SharePoint
- [ ] Luồng AI: Upload PDF → OCR → Tóm tắt → Phân loại → Lưu vào pgvector
- [ ] Luồng thông báo: Quá hạn SLA → Kafka event → Email + Teams + in-app
- [ ] Luồng SSO: Login Azure AD → Tạo user nội bộ → JWT → Truy cập API
- [ ] Test với 100 user đồng thời (yêu cầu MVP tối thiểu)

### 6.3 Security Audit

**Checklist bắt buộc:**

- [ ] JWT: kiểm tra expiry, refresh token rotation, blacklist khi logout
- [ ] CORS: chỉ cho phép domain frontend được cấu hình
- [ ] SQL Injection: kiểm tra tất cả query dùng parameterized statements
- [ ] Path traversal: kiểm tra file upload path sanitization
- [ ] Rate limiting: API Gateway giới hạn request/phút per user
- [ ] Secrets: không có hardcode credential trong source code (`.env` only)
- [ ] HTTPS: enforce TLS 1.2+ trên tất cả endpoints production
- [ ] Azure token: refresh token được lưu encrypted, không log ra

### 6.4 Penetration Testing (cơ bản)

- [ ] OWASP ZAP scan trên staging environment
- [ ] Test SQL injection trên các form input
- [ ] Test XSS trên các field hiển thị nội dung văn bản
- [ ] Test IDOR: truy cập tài nguyên của user khác qua ID manipulation
- [ ] Test file upload: upload file độc hại (script, oversized)
- [ ] Ghi lại kết quả vào `SECURITY_AUDIT.md`

### 6.5 Performance Testing

- [ ] JMeter / k6 test: 100 concurrent users upload văn bản
- [ ] Đo response time API CRUD cơ bản (mục tiêu < 500ms)
- [ ] Đo thời gian OCR với file 10MB (mục tiêu < 30s)
- [ ] Đo chatbot RAG response time (mục tiêu < 3s)
- [ ] Kiểm tra memory leak sau 1 giờ chạy liên tục

---

## Phụ thuộc kỹ thuật

| Thứ cần chuẩn bị | Dùng cho | Ưu tiên | Ghi chú |
|---|---|---|---|
| Azure App Registration (Client ID, Secret, Tenant ID) | SSO + Graph API | **CRITICAL** | Cần IT admin tenant |
| Microsoft 365 tenant admin consent | SharePoint, Teams, Outlook | **CRITICAL** | Grant permissions |
| CA Provider API (VNPT CA / Viettel CA) | Ký số điện tử | HIGH | Liên hệ nhà cung cấp |
| Tesseract OCR hoặc Azure AI Vision key | OCR engine | MEDIUM | Tesseract free, Azure Vision có phí |
| SharePoint Site ID + Drive ID | Lưu trữ tài liệu | HIGH | Lấy qua Graph Explorer |
| Teams Channel Webhook URL | Thông báo Teams | MEDIUM | Tạo trong Teams admin |

---

## Rủi ro

| Rủi ro | Mức độ | Kế hoạch xử lý |
|---|---|---|
| Azure AD tenant chưa được cấp quyền admin | 🔴 HIGH | Liên hệ IT admin cơ quan ngay từ Phase 1 |
| Microsoft Graph API thay đổi permission model | 🟡 MEDIUM | Theo dõi Microsoft changelog, dùng stable API version |
| Graph API rate limiting (10,000 req/10 min) | 🟡 MEDIUM | Implement caching + exponential backoff |
| Ký số cần USB token vật lý | 🔴 HIGH | Ưu tiên cloud-based CA (VNPT RemoteSign) trước |
| OCR chất lượng thấp với văn bản scan xấu | 🟡 MEDIUM | Tiền xử lý ảnh (deskew, denoise) trước khi OCR |
| Frontend thiếu test coverage | 🟡 MEDIUM | Thêm Vitest song song với Phase 2 |
| JWT private key lộ (jwt-keys/ trong repo) | 🔴 HIGH | **Ngay lập tức:** rotate keys, thêm `jwt-keys/` vào `.gitignore` |
| Kafka consumer lag khi tải cao | 🟡 MEDIUM | Monitor consumer group lag, scale notification-service |

> ⚠️ **Lưu ý bảo mật khẩn cấp:** Thư mục `qlda-system/jwt-keys/` chứa `private.pem` và `public.pem` đang bị track bởi git. Cần rotate key pair ngay và thêm vào `.gitignore`.

---

## Tổng hợp tiến độ

```
Timeline (1 developer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tuần 1:  [Phase 1] Audit (2 ngày) + [Phase 2] Frontend bắt đầu (3 ngày)
Tuần 2:  [Phase 2] Frontend hoàn thiện (2 ngày) + [Phase 3] Azure SSO (3 ngày)
Tuần 3:  [Phase 3] SharePoint + Email + Teams (4 ngày) + [Phase 4] bắt đầu (1 ngày)
Tuần 4:  [Phase 4] OneDrive + Ký số (3 ngày) + [Phase 5] Backend bổ sung (2 ngày)
Tuần 5:  [Phase 5] hoàn thiện (1 ngày) + [Phase 6] Testing & Security (4 ngày)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tổng: ~20 ngày làm việc (4 tuần)
Rút ngắn: ~12 ngày nếu chạy song song Phase 2 & 3 với 2 developer
```

### Thứ tự ưu tiên khi nguồn lực hạn chế

1. **Must have (Giai đoạn 2 MVP):** Phase 1 + Phase 2 + Phase 3 (SSO + SharePoint + Email)
2. **Should have:** Phase 4 (OneDrive + Ký số) + Phase 5 (SLA scheduler + Ủy quyền)
3. **Nice to have:** Teams integration + Long-term archive + Performance tuning

### Định nghĩa hoàn thành (Definition of Done)

- [ ] Tất cả API unit test pass
- [ ] Integration test luồng chính pass
- [ ] Security audit không có lỗi CRITICAL
- [ ] Response time < 500ms cho API thông thường
- [ ] 100 concurrent users không gây lỗi 5xx
- [ ] Không có hardcode secret trong source code
- [ ] Demo được cho Ban Giám đốc trên staging environment
