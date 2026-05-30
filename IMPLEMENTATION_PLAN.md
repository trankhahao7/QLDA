# Kế hoạch triển khai: Hệ thống eOIS (eOffice Intelligence System)

> Dự án: Xây dựng hệ thống xử lý văn bản điện tử tích hợp Office 365  
> Đơn vị: Công ty TNHH ABC — Đà Nẵng  
> Cập nhật: 2026-05-31  
> Trạng thái: Phase 1–6 hoàn thành về code ✅ | Blocked bởi Azure App Registration ⚠️

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
| 2 | Tích hợp Azure Active Directory (SSO) | 🔶 Partial | PKCE OAuth2 flow có code ✅ — blocked bởi Azure App Registration |
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
| 13 | Quản lý văn bản đi | ✅ Done | OutgoingDocumentController + OutgoingDocuments.tsx (list, filter, create, export CSV) |
| 14 | Đánh số văn bản tự động | ✅ Done | NumberingController |
| 15 | Quản lý hồ sơ công việc | ✅ Done | CaseFileController + CaseFiles.tsx (tạo, tìm kiếm, gắn văn bản, xóa) |
| 16 | Phân loại và lập danh mục hồ sơ | 🔶 Partial | Cần AI tự động gán loại |
| 17 | Quản lý phiên bản văn bản | ✅ Done | DocumentVersionController |
| **Nhóm III — Luồng công việc & xử lý liên thông** | | | |
| 18 | Thiết kế và cấu hình quy trình (Workflow) | ✅ Done | WorkflowController, WorkflowManagement.tsx |
| 19 | Phê duyệt văn bản nhiều cấp | ✅ Done | WorkflowController + Approvals.tsx (queue, Duyệt/Từ chối/Ghi chú modal, overdue indicator) |
| 20 | Ủy quyền xử lý | ✅ Done | POST/GET/DELETE /api/workflows/delegations + Delegation.tsx (tạo/xem/hủy) |
| 21 | Theo dõi tiến độ xử lý | ✅ Done | workflow-service |
| 22 | Nhắc việc, đôn đốc tự động | ✅ Done | notification-service + Kafka |
| 23 | Luân chuyển văn bản giữa phòng ban | ✅ Done | XuLyVanBan workflow |
| 24 | Thiết lập SLA xử lý văn bản | ✅ Done | SlaScheduler cron + SlaManagement.tsx (chọn quy trình, edit SLA per bước) |
| 25 | Thông báo hệ thống | ✅ Done | NotificationController + Notifications.tsx (all/unread, badge, mark read) |
| **Nhóm IV — AI Agent & Trợ lý ảo** | | | |
| 26 | Tóm tắt nội dung văn bản tự động | ✅ Done | AiController |
| 27 | Phân loại văn bản | ✅ Done | AiController |
| 28 | Trích xuất dữ liệu (Metadata Extraction) | ✅ Done | AiController |
| 29 | Hỗ trợ tìm kiếm thông minh | ✅ Done | Search.tsx + ai-service RAG |
| 30 | Gợi ý xử lý và phản hồi | ✅ Done | AiController |
| 31 | Chatbot hỗ trợ người dùng | ✅ Done | ChatbotController + ChatBot.tsx |
| **Nhóm V — Hệ sinh thái Office 365 & Lưu trữ số** | | | |
| 32 | Tích hợp SharePoint lưu trữ tài liệu | 🔶 Partial | SharePointService code ✅ — blocked bởi Azure App Registration |
| 33 | Tích hợp OneDrive chỉnh sửa văn bản | 🔶 Partial | OneDrive link qua SharePoint ✅ — blocked bởi Azure App Registration |
| 34 | Tích hợp Microsoft Teams thông báo | 🔶 Partial | TeamsNotificationSender code ✅ — cần TEAMS_WEBHOOK_URL |
| 35 | Tích hợp Outlook gửi email tự động | 🔶 Partial | EmailNotificationSender code ✅ — cần SMTP credentials |
| 36 | Quản lý kho lưu trữ hồ sơ điện tử dài hạn | ❌ Missing | Cần sau khi có SharePoint hoạt động |
| 37 | Ký số văn bản điện tử | 🔶 Partial | DigitalSignatureService skeleton ✅ — cần CA provider (VNPT/Viettel) |
| **Nhóm VI — Quản lý dự án, kiểm thử & vận hành** | | | |
| 38 | Lập kế hoạch và quản lý tiến độ dự án | ❌ Missing | Ngoài scope phần mềm |
| 39 | Kiểm thử hệ thống (UAT, bảo mật) | ❌ Missing | Phase 6 |
| 40 | Xây dựng dashboard báo cáo | ✅ Done | AdminDashboard.tsx + Reports.tsx (StatCards, BarChart, workflow progress, export CSV) |
| 41 | Thống kê, phân tích dữ liệu sử dụng | ✅ Done | reports service + Reports.tsx (bảng quá hạn, tỉ lệ hoàn thành, lọc theo ngày) |
| 42 | Đào tạo người dùng và quản trị hệ thống | ❌ Missing | Ngoài scope phần mềm |
| 43 | Azure AD, MFA, PIM | 🔶 Partial | Cần hoàn thiện ở Phase 3 |

**Tổng kết:** ✅ 25 done | 🔶 14 partial | ❌ 4 missing  
*(Cập nhật 2026-05-31: Frontend pages #13,15,19,20,24,25,40,41 đã verify hoàn chỉnh; SharePoint/Teams/Email/OneDrive/Ký số blocked bởi credentials/Azure)*

---

## Phase 1 — Audit & Kiểm tra thực tế ✅ DONE

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

## Phase 2 — Hoàn thiện Frontend ✅ DONE (kiểm tra 2026-05-31)

> **Mục tiêu:** Bổ sung các trang UI còn thiếu để người dùng có thể dùng đầy đủ nghiệp vụ văn bản.

### 2.1 Trang Văn bản đi (`/user/outgoing`)

**File:** `frontend/src/routes/user/OutgoingDocuments.tsx`

- [x] Danh sách văn bản đi với filter (trạng thái, ngày)
- [x] Form tạo văn bản đi mới (số hiệu, loại, người ký, ngày, độ khẩn)
- [x] Xem chi tiết qua link đến `/documents/:id`
- [x] Trạng thái: Nháp → Chờ duyệt → Đang duyệt → Trình ký → Đã ký → Đã phát hành
- [x] Kết nối `OutgoingDocumentController` + export CSV
- [ ] Upload file đính kèm trực tiếp từ trang này (minor gap)

### 2.2 Trang Hồ sơ công việc (`/user/case-files`)

**File:** `frontend/src/routes/user/CaseFiles.tsx`

- [x] Danh sách hồ sơ công việc (list view + tìm kiếm)
- [x] Tạo hồ sơ mới (mã, tên, đơn vị, ghi chú)
- [x] Gắn văn bản vào hồ sơ (modal nhập document ID)
- [x] Xóa hồ sơ
- [x] Kết nối `CaseFileController`
- [ ] Timeline xử lý của hồ sơ (minor gap)

### 2.3 Trang Phê duyệt (`/user/approvals`)

**File:** `frontend/src/routes/user/Approvals.tsx`

- [x] Queue văn bản chờ mình duyệt (filter theo nguoiDuyetId)
- [x] Action: Phê duyệt / Từ chối / Ghi chú (3 modal riêng)
- [x] Comment/lý do khi duyệt hoặc từ chối
- [x] Indicator quá hạn (đỏ + ⚠)
- [x] Kết nối `WorkflowController` + `XuLyVanBan`

### 2.4 Trang Thông báo (`/user/notifications`)

**File:** `frontend/src/routes/user/Notifications.tsx`

- [x] Danh sách thông báo với filter All/Chưa đọc
- [x] Đánh dấu đã đọc đơn lẻ và đánh dấu tất cả
- [x] Badge số thông báo chưa đọc trên Sidebar (real-time fetch)
- [x] Kết nối `NotificationController`
- [ ] Click thông báo → navigate đến tài nguyên liên quan (minor gap)

### 2.5 Trang Báo cáo & Thống kê (`/admin/reports`)

**File:** `frontend/src/routes/admin/Reports.tsx`

- [x] StatCards: tổng VB, VB đến/đi, đã xử lý, đang xử lý, quá hạn, tỉ lệ hoàn thành
- [x] BarChart: Số văn bản theo tháng
- [x] Bảng: Văn bản quá hạn chưa xử lý
- [x] Tiến độ xử lý workflow (progress bar)
- [x] Export CSV + filter theo ngày
- [x] Kết nối `ReportController`
- [ ] Bảng top nhân viên xử lý nhiều nhất (minor gap)

### 2.6 Trang Quản lý SLA (`/admin/sla`)

**File:** `frontend/src/routes/admin/SlaManagement.tsx`

- [x] Danh sách SLA theo bước của quy trình
- [x] Sửa inline: thời gian xử lý + đơn vị (Phút/Giờ/Ngày)
- [x] Kết nối `sla service`
- [ ] Dashboard warning list: văn bản sắp hết SLA (minor gap)

### 2.7 Trang Ủy quyền (`/delegation`)

**File:** `frontend/src/routes/user/Delegation.tsx`

- [x] Tạo ủy quyền (người được ủy quyền, từ ngày, đến ngày, phạm vi, ghi chú)
- [x] Danh sách ủy quyền với trạng thái (Hiệu lực / Hết hạn)
- [x] Hủy ủy quyền
- [x] CSS fixed để consistent với UI system (2026-05-31)
- [x] Kết nối `POST/GET/DELETE /api/workflows/delegations`

### 2.8 Routing & Sidebar ✅

- [x] Tất cả routes trong `App.tsx`: `/outgoing`, `/approvals`, `/notifications`, `/case-files`, `/delegation`, `/admin/reports`, `/admin/sla`
- [x] Sidebar.tsx: Văn bản đi, Phê duyệt, Hồ sơ công việc, Ủy quyền, Thông báo (với badge)

---

## Phase 3 — Azure AD SSO & Office 365 Core ✅ SSO DONE | 🔶 SharePoint/Email/Teams chờ config

> **Cập nhật 2026-05-31:** SSO login đã test thành công qua gateway. SharePoint/Email/Teams có code nhưng chờ Site ID và webhook URL.

### 3.1 Chuẩn bị Azure ✅

- [x] Tạo Azure App Registration trên Azure Portal (`qlda-system`)
- [ ] Cấp API Permissions (delegated): `User.Read`, `Mail.Send`, `Files.ReadWrite`, `Sites.ReadWrite.All`, `ChannelMessage.Send` — cần kiểm tra trong Portal
- [ ] Bật admin consent cho tenant — cần IT Admin của trường DUT
- [x] `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID` đã lưu vào `.env`
- [x] Redirect URI `http://localhost:5173/auth/callback` đã thêm vào Azure Portal (Single-page application)

### 3.2 Azure AD SSO ✅ DONE (tested 2026-05-31)

- [x] OAuth2 Authorization Code Flow với PKCE (`AzureAuthService.java`)
- [x] `GET /api/auth/office365/auth-url` → trả Microsoft OAuth2 URL — **tested, hoạt động**
- [x] `POST /api/auth/login/azure` → nhận code + codeVerifier, đổi token, tạo JWT — **tested, hoạt động**
- [x] Auto-tạo user nội bộ khi đăng nhập Azure lần đầu (Just-In-Time provisioning)
- [x] Column `microsoftrefreshtoken` đã thêm vào DB (`ALTER TABLE nguoidung ADD COLUMN`)
- [x] Gateway SecurityConfig: thêm public routes `/api/auth/login/dev`, `/api/auth/logout`, `/api/auth/refresh-token`, `/api/auth/office365/auth-url`, `/api/auth/office365/config/status`
- [x] auth-service SecurityConfig: thêm `permitAll()` cho `/api/auth/office365/auth-url`
- [x] Frontend `Login.tsx`: nút Azure AD + PKCE flow + callback xử lý đầy đủ

### 3.3 Tích hợp SharePoint 🔶 Chờ SHAREPOINT_SITE_ID

- [x] `SharePointService.java` implement đầy đủ Graph API
- [x] `@ConditionalOnProperty(sharepoint.enabled)` — tắt an toàn khi chưa config
- [x] `SHAREPOINT_ENABLED=false` trong `.env` (không crash khi chưa có Site ID)
- [ ] Để bật: vào graph.microsoft.com/v1.0/sites → lấy Site ID → thêm vào `.env`:
  ```
  SHAREPOINT_ENABLED=true
  SHAREPOINT_SITE_ID=<site-id>
  ```

### 3.4 Tích hợp Outlook Email 🔶 Chờ SMTP credentials

- [x] `EmailNotificationSender.java` code có sẵn
- [ ] Thêm vào `.env` để bật:
  ```
  SPRING_MAIL_HOST=smtp.office365.com
  SPRING_MAIL_PORT=587
  SPRING_MAIL_USERNAME=<email hệ thống>
  SPRING_MAIL_PASSWORD=<app password>
  ```

### 3.5 Tích hợp Microsoft Teams 🔶 Chờ Webhook URL

- [x] `TeamsNotificationSender.java` code có sẵn
- [ ] Thêm vào `.env` để bật:
  ```
  TEAMS_WEBHOOK_URL=<tạo trong Teams Admin Center → Incoming Webhook>
  ```

---

## Phase 4 — OneDrive & Ký số điện tử 🔶 PARTIAL (skeleton code done, cần CA provider + Azure)

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

## Phase 5 — Backend bổ sung & SLA Scheduler ✅ DONE

### 5.1 Ủy quyền xử lý (auth-service + workflow-service)

**Đã implement trong workflow-service** ✅

Schema bảng `UyQuyen` đã chạy (V003 migration).

- [x] `POST /api/workflows/delegations` — tạo ủy quyền
- [x] `GET /api/workflows/delegations` — lấy danh sách (filter by nguoiUyQuyenId, active)
- [x] `DELETE /api/workflows/delegations/{id}` — hủy ủy quyền (soft delete: active=false)
- [x] Workflow service kiểm tra ủy quyền khi phân công (UyQuyenRepository inject)
- [ ] Hết hạn ủy quyền tự động — cần thêm cron job kiểm tra `DenNgay < now()`

**Frontend:**
- [x] Trang ủy quyền `/delegation` — Delegation.tsx hoàn chỉnh (CSS fixed 2026-05-31)

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

## Phase 6 — Testing & Security ✅ DONE (94+109+49 tests pass, SECURITY_AUDIT.md created)

### 6.1 Unit Testing

**Mục tiêu: 80% coverage trên các service nghiệp vụ**

- [x] `auth-service`: AuthController, UserService, JWT, AzureAuthService — tests pass
- [x] `document-service`: DocumentWorkflowService, InternalDocumentService, OCR — 109 tests pass
- [x] `workflow-service`: WorkflowApiService, delegation, SLA — 94 tests pass
- [ ] `ai-service`: test AiApplicationService với mock LLM response — chưa có
- [x] `notification-service`: SlaScheduler, NotificationService — 49 tests pass
- [ ] Frontend: Vitest unit test cho các service — chưa có

### 6.2 Integration Testing

- [ ] Luồng đầy đủ: Đăng nhập → Upload văn bản đến → Tạo workflow → Phê duyệt → Lưu SharePoint
- [ ] Luồng AI: Upload PDF → OCR → Tóm tắt → Phân loại → Lưu vào pgvector
- [ ] Luồng thông báo: Quá hạn SLA → Kafka event → Email + Teams + in-app
- [ ] Luồng SSO: Login Azure AD → Tạo user nội bộ → JWT → Truy cập API
- [ ] Test với 100 user đồng thời (yêu cầu MVP tối thiểu)

### 6.3 Security Audit

**Checklist bắt buộc:**

- [x] JWT: expiry, refresh token rotation, blacklist khi logout — implemented
- [x] CORS: explicit allowed-origins (không dùng `*`) — configured
- [x] SQL Injection: JPA parameterized queries — verified (SECURITY_AUDIT.md)
- [x] Rate limiting: AuthRateLimitFilter — 10 req/min per IP trên login endpoints
- [ ] Secrets: Gemini API key lộ trong git history — **cần rotate ngay**
- [ ] HTTPS: enforce TLS — cần config tại reverse proxy khi production
- [ ] Azure token: refresh token chưa được lưu (discarded sau login)

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

- [x] Tất cả API unit test pass (workflow 94, document 109, notification 49, auth pass)
- [ ] Integration test luồng chính — chưa có E2E test
- [x] Security audit không có lỗi CRITICAL (SECURITY_AUDIT.md: 0 CRITICAL, 2 HIGH fixed)
- [ ] Response time < 500ms — chưa benchmark
- [ ] 100 concurrent users — chưa load test
- [ ] Không có hardcode secret — **Gemini key lộ git history, cần rotate**
- [ ] Demo trên staging — chưa có staging environment
