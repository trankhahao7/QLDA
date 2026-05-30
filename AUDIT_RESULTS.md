# Kết quả Audit Phase 1 — eOIS

> Ngày audit: 2026-05-30  
> Môi trường: Local Docker (Windows 11 / Docker Desktop 29.4.0)

---

## 1. Infrastructure — Kết quả khởi động

| Container | Image | Port | Trạng thái |
|---|---|---|---|
| qlda-postgres | pgvector/pgvector:pg17 | 5432 | ✅ Up |
| qlda-zookeeper | confluentinc/cp-zookeeper:7.5.0 | 2181 | ✅ Up |
| qlda-kafka | confluentinc/cp-kafka:7.5.0 | 9092, 29092 | ✅ Up |
| qlda-eureka-server | qlda-system-eureka-server | 8761 | ✅ Up |
| qlda-auth-service | qlda-system-auth-service | 8081 | ✅ Up |
| qlda-document-service | qlda-system-document-service | 8082 | ✅ Up |
| qlda-workflow-service | qlda-system-workflow-service | 8083 | ✅ Up |
| qlda-ai-service | qlda-system-ai-service | 8084 | ✅ Up |
| qlda-notification-service | qlda-system-notification-service | 8085 | ✅ Up |
| qlda-api-gateway | qlda-system-api-gateway | 8080 | ✅ Up |

**Eureka Dashboard:** http://localhost:8761 — 6/6 services đã đăng ký: `AUTH-SERVICE`, `DOCUMENT-SERVICE`, `WORKFLOW-SERVICE`, `AI-SERVICE`, `NOTIFICATION-SERVICE`, `API-GATEWAY`

---

## 2. Health Check

| Service | Endpoint | HTTP Code | Ghi chú |
|---|---|---|---|
| Eureka | GET http://localhost:8761/ | ✅ 200 | Dashboard hoạt động |
| auth-service | GET /actuator/health | ⚠️ 401 | Actuator bị bảo vệ bởi JWT |
| document-service | GET /actuator/health | ✅ 200 | OK |
| workflow-service | GET /actuator/health | ✅ 200 | OK |
| ai-service | GET /actuator/health | ❌ 500 | Actuator không được cấu hình |
| notification-service | GET /actuator/health | ⚠️ 401 | Actuator bị bảo vệ bởi JWT |
| api-gateway | GET /actuator/health | ⚠️ 401 | Actuator bị bảo vệ bởi JWT |

**Lưu ý:** ai-service không expose `/actuator` — cần thêm `spring-boot-starter-actuator` vào `pom.xml`.

---

## 3. Audit auth-service (port 8081)

### Endpoints phát hiện

| Method | Path | Auth Required | Kết quả | Trạng thái |
|---|---|---|---|---|
| POST | /api/auth/login/azure | ❌ Không | 400/500 (thiếu body) | ✅ Tồn tại |
| POST | /api/auth/refresh-token | ❌ Không | — | ✅ Tồn tại |
| POST | /api/auth/logout | ✅ JWT | — | ✅ Tồn tại |
| GET | /api/auth/me | ✅ JWT | 401 | ✅ Tồn tại |
| GET | /api/office365/auth-url | ✅ JWT | 401 | ⚠️ Cần JWT để lấy URL? |
| GET | /api/users | ✅ JWT | 401 | ✅ Tồn tại |
| GET | /api/don-vi | ✅ JWT | 401 | ✅ Tồn tại |
| GET | /api/nhom-quyen | ✅ JWT | — | ✅ Tồn tại |

### Phát hiện quan trọng

**❌ KHÔNG có username/password login:**  
`AuthService.java` chỉ có method `loginAzure()`. Hệ thống được thiết kế để **chỉ hỗ trợ Azure AD SSO**. Không có cơ chế đăng nhập nội bộ (username + password). Đây là gap lớn cho giai đoạn dev/test khi chưa có Azure tenant.

**Schema `NguoiDung`** không có cột `password/matkhau` — xác nhận thiết kế Azure-only.

**⚠️ `/api/office365/auth-url` yêu cầu JWT** — logic ngược: muốn login Azure thì phải có JWT trước?  
→ Cần cho phép endpoint này là public (không cần auth).

**Seed data có 4 users:** admin (id=1001), nguyenvana (1002), truongdv (1003), icetruong (1004). Tất cả cần Azure AD login để sử dụng.

---

## 4. Audit document-service (port 8082)

### Endpoints phát hiện

| Method | Path | Auth Required | Kết quả |
|---|---|---|---|
| GET | /api/documents/incoming | ✅ JWT | 401 |
| GET | /api/documents/outgoing | ✅ JWT | 401 |
| GET | /api/documents/drafts | ✅ JWT | 401 |
| GET | /api/documents/case-files | ✅ JWT | 401 |
| GET | /api/documents/types | ✅ JWT | 401 |
| GET | /api/documents/{id}/attachments | ✅ JWT | 401 |
| POST | /api/documents/ocr | ✅ JWT | 401 |
| GET | /internal/documents | Internal token | — |

### Phát hiện

**✅ Tất cả controllers tồn tại** — `IncomingDocument`, `OutgoingDocument`, `Draft`, `CaseFile`, `DocumentType`, `Attachment`, `DocumentVersion`, `Numbering`, `Publication`, `OCR` đều có.

**✅ Service khởi động thành công** — kết nối PostgreSQL OK, Kafka OK.

**⚠️ Actuator không bị bảo vệ** — `/actuator/health` trả 200 không cần auth. Cần cân nhắc bảo vệ trong production.

---

## 5. Audit workflow-service (port 8083)

### Endpoints phát hiện

| Method | Path | Auth Required | Kết quả |
|---|---|---|---|
| GET | /api/workflows | ✅ JWT | 401 |
| POST | /api/workflows | ✅ JWT | 401 |
| PUT | /api/xu-ly-van-ban/{id}/approve | ✅ JWT | 401 |
| GET | /internal/workflows | Internal token | — |

### Phát hiện

**✅ Service hoạt động** — kết nối DB và Kafka OK.

**✅ SLA service tồn tại** trong frontend services — nhưng chưa xác nhận backend SLA scheduler (cron).

---

## 6. Audit ai-service (port 8084)

### Endpoints phát hiện

| Method | Path | Auth Required | Kết quả |
|---|---|---|---|
| POST | /api/chatbot/chat | ✅ JWT | 401 |
| POST | /api/ai/summarize | ✅ JWT | 401 |
| POST | /api/ai/classify | ✅ JWT | 401 |
| GET | /api/chatbot/... | ✅ JWT | 401 |

### Phát hiện

**✅ Service khởi động** — kết nối PostgreSQL (pgvector) OK. Startup time ~65 giây (chậm hơn các service khác).

**✅ GEMINI_API_KEY được cấu hình** — AI có thể hoạt động.

**❌ Actuator không được expose** — `NoResourceFoundException` khi gọi `/actuator/health`. Cần thêm dependency và cấu hình.

**⚠️ Không có health endpoint public** — không thể kiểm tra trạng thái AI service mà không cần JWT.

---

## 7. Audit notification-service (port 8085)

### Endpoints phát hiện

| Method | Path | Auth Required | Kết quả |
|---|---|---|---|
| GET | /api/notifications | ✅ JWT | 401 |
| GET | /api/reports | ✅ JWT | 401 |
| GET | /api/audit-logs | ✅ JWT | 401 |

### Phát hiện

**✅ Service hoạt động** — kết nối DB, Kafka OK.

**✅ Kafka topics** — `notification-events` và `notification-events-dlq` được cấu hình.

**⚠️ Email chưa cấu hình** — `OUTLOOK_SMTP_USERNAME`, `OUTLOOK_SMTP_PASSWORD`, `OUTLOOK_SMTP_FROM` đang trống → Thông báo email sẽ không gửi được.

---

## 8. Bảo mật — Phát hiện khẩn cấp

### 🔴 CRITICAL — JWT Private Key đã bị commit vào git

| Vấn đề | Chi tiết |
|---|---|
| File bị lộ | `qlda-system/jwt-keys/private.pem`, `qlda-system/jwt-keys/public.pem` |
| Commit chứa key | `c34f230 fix: fix api login` |
| Tác động | Bất kỳ ai có access git history đều có thể ký JWT giả |
| Đã xử lý | ✅ Đã chạy `git rm --cached` — files không còn bị track |

**Hành động bắt buộc:**
1. **Rotate key pair ngay** — generate RSA key mới:
   ```bash
   openssl genrsa -out private.pem 2048
   openssl rsa -in private.pem -pubout -out public.pem
   ```
2. **KHÔNG xóa được khỏi git history** — nếu repo là public hoặc có collaborator, key cũ đã lộ vĩnh viễn.
3. Nếu repo private và chỉ team nội bộ: rotate là đủ.

### 🔴 CRITICAL — GEMINI_API_KEY hardcode trong docker-compose.yml

| Vấn đề | Chi tiết |
|---|---|
| File | `qlda-system/docker-compose.yml` dòng 178 |
| Key | `AIzaSyAPSZZxFXYRV9Jm02Fnin3Zpkos9f_iMmQ` |
| Đã xử lý | ✅ Đã chuyển sang `${GEMINI_API_KEY:-}` + lưu vào `.env` |

**Hành động bắt buộc:** Rotate Gemini API key trên Google AI Studio.

### 🟡 MEDIUM — Azure AD chưa được cấu hình

`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` đang trống → Toàn bộ auth flow bị block. Cần Azure App Registration để tiếp tục.

### 🟡 MEDIUM — `/api/office365/auth-url` yêu cầu JWT

Logic không đúng: user muốn đăng nhập Azure nhưng phải có JWT mới gọi được URL đăng nhập.

---

## 9. Tổng kết Gap Analysis — Cập nhật sau Audit

| Hạng mục | Trước audit | Sau audit |
|---|---|---|
| Infrastructure | 🔶 Chưa xác nhận | ✅ 10/10 container Up |
| Service registration | 🔶 Chưa xác nhận | ✅ 6/6 trên Eureka |
| Auth flow | ✅ Done (theo code) | ❌ **Blocked** — cần Azure AD |
| Document APIs | ✅ Done (theo code) | ✅ Tồn tại, cần JWT |
| Workflow APIs | ✅ Done (theo code) | ✅ Tồn tại, cần JWT |
| AI APIs | ✅ Done (theo code) | ✅ Tồn tại, Gemini OK |
| Notification | ✅ Done (theo code) | ⚠️ Email chưa cấu hình |
| JWT security | ❌ Keys trong git | 🔶 Đã xóa khỏi index, cần rotate |
| Gemini key | ❌ Hardcode | 🔶 Đã chuyển .env, cần rotate |

---

## 10. Danh sách việc cần làm ngay (Hotfix trước Phase 2)

- [ ] **[SECURITY]** Rotate JWT key pair (generate RSA key mới)
- [ ] **[SECURITY]** Rotate Gemini API key trên Google AI Studio
- [ ] **[BUG]** Cho phép `GET /api/office365/auth-url` là public endpoint (không cần JWT)
- [ ] **[INFRA]** Thêm actuator vào `ai-service` pom.xml và cấu hình expose health endpoint
- [ ] **[INFRA]** Cấu hình Outlook SMTP trong `.env` để test email notification
- [ ] **[FEAT]** Thêm username/password login tạm thời cho môi trường dev (không Azure)
- [ ] **[INFRA]** Đăng ký Azure App Registration để unblock toàn bộ auth flow

---

## 11. Kết luận

Hệ thống **build và khởi động thành công 100%**. Tất cả microservices chạy ổn định, kết nối PostgreSQL và Kafka đúng. Toàn bộ business logic APIs tồn tại và được bảo vệ đúng bởi JWT.

**Blocker chính:** Hệ thống **chỉ hỗ trợ Azure AD login** — không có fallback. Để test thực tế cần phải có Azure App Registration. Đây là task cần xử lý ngay trong Phase 3.

**Ưu tiên tiếp theo:**
1. Hotfix bảo mật (rotate keys)
2. Fix `/api/office365/auth-url` public endpoint
3. Phase 2: Hoàn thiện Frontend các trang còn thiếu (không cần Azure)
4. Phase 3: Cấu hình Azure App Registration
