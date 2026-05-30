# eOIS — Danh sách việc còn lại

> Cập nhật: 2026-05-30  
> Trạng thái tổng: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ⚠️ | Phase 4 ⚠️ | Phase 5 ✅ | Phase 6 ✅

---

## 🔴 Bắt buộc trước khi chạy (chưa làm sẽ bị lỗi)

### 1. Chạy SQL migrations

```sql
-- Chạy theo thứ tự trên PostgreSQL QLDA database
\i qlda-system/migrations/V003__uy_quyen.sql
\i qlda-system/migrations/V004__vanban_enhancements.sql
```

- `V003` — tạo bảng `UyQuyen` (delegation)
- `V004` — thêm cột `NoiDungOCR`, `AiPhanLoai`, `AiConfidence` vào `VanBan`

### 2. Rebuild services sau migrations

```bash
docker --context desktop-linux compose -f qlda-system/docker-compose.yml up --build -d \
  workflow-service notification-service document-service api-gateway
```

---

## 🟡 Cần config để mở khoá tính năng đã có code

### Office 365 — SharePoint + OneDrive

Thêm vào `qlda-system/.env`:

```env
OFFICE365_TENANT_ID=<từ Azure Portal>
OFFICE365_CLIENT_ID=<từ Azure Portal>
OFFICE365_CLIENT_SECRET=<từ Azure Portal>
SHAREPOINT_ENABLED=true
SHAREPOINT_SITE_ID=<lấy qua Graph Explorer>
```

Code đã có: `SharePointService.java` — upload file lên SharePoint khi phát hành văn bản, tạo view link + OneDrive edit link.

### Teams Notification

Thêm vào `qlda-system/.env`:

```env
TEAMS_WEBHOOK_URL=<tạo trong Teams Admin Center → Incoming Webhook>
```

Code đã có: `TeamsNotificationSender.java` — gửi MessageCard khi có sự kiện workflow/SLA.

### Email (Outlook SMTP)

Thêm vào `qlda-system/.env`:

```env
SPRING_MAIL_HOST=smtp.office365.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=<email hệ thống>
SPRING_MAIL_PASSWORD=<app password hoặc OAuth>
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
```

Code đã có: `EmailNotificationSender.java` — gửi email qua Spring JavaMailSender.

### API Gateway — Production CORS

Khi deploy production, sửa `qlda-system/api-gateway/src/main/resources/application.yml`:

```yaml
allowed-origins:
  - "https://eois.yourdomain.com"   # thay localhost:5173
```

---

## 🟠 Cần code thêm (chưa implement)

### Azure SSO — Browser redirect flow

**Hiện tại:** `AuthController` có `POST /api/auth/login/azure` nhận token từ frontend, nhưng chưa có endpoint tạo redirect URL cho browser.

**Cần thêm:**

```java
// auth-service/Office365Controller.java
@GetMapping("/auth-url")
public ApiResponse<String> getAuthUrl() {
    // Trả URL: https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?...
}

@GetMapping("/callback")
public void handleCallback(@RequestParam String code, HttpServletResponse response) {
    // Đổi code lấy token → tạo JWT nội bộ → redirect về frontend
}
```

**Frontend cần:** nút "Đăng nhập bằng Office 365" trên `Login.tsx`.

### Dev Login — Profile guard

Thêm `@Profile("!prod")` để endpoint không tồn tại trong production:

```java
// AuthController.java
@PostMapping("/login/dev")
@Profile("!prod")   // thêm dòng này
public ApiResponse<AuthTokenResponse> loginDev(...) { ... }
```

### Rate Limiting trên API Gateway

Cần thêm Redis vào `docker-compose.yml`, sau đó config `RequestRateLimiter` filter trong `application.yml`. Xem chi tiết tại `SECURITY_AUDIT.md` → M1.

---

## 🔑 Bảo mật — Việc cần làm ngay

| Việc | Lý do | Link |
|---|---|---|
| Rotate Gemini API key | Đã lộ trong git history (commit c34f230) | https://aistudio.google.com/app/apikey |
| Verify `.gitignore` bao gồm `qlda-system/.env` | Tránh commit secrets | Kiểm tra `.gitignore` ở root |
| Xác nhận `auth.dev-password.enabled=false` trong prod config | Dev login gated | `application.yml` của auth-service |

---

## 📋 Checklist trước Demo / Production

- [ ] V003 + V004 migrations đã chạy
- [ ] Tất cả services rebuild thành công
- [ ] CORS `allowed-origins` đã cập nhật thành production domain
- [ ] `SHAREPOINT_ENABLED=false` (hoặc true nếu đã có Azure config)
- [ ] `auth.dev-password.enabled=false` trong production profile
- [ ] Gemini API key đã rotate
- [ ] Swagger UI tắt trong production (`springdoc.swagger-ui.enabled=false`)
- [ ] HTTPS enforcement tại reverse proxy (TLS 1.2+)
- [ ] Chạy OWASP ZAP baseline scan trên staging

---

## 📊 Trạng thái 43 chức năng (cập nhật)

| Nhóm | Done | Partial | Missing |
|---|---|---|---|
| I — Quản trị & bảo mật | 3 | 4 | 0 |
| II — Nghiệp vụ văn bản | 7 | 3 | 0 |
| III — Luồng công việc | 6 | 1 | 0 |
| IV — AI Agent | 6 | 0 | 0 |
| V — Office 365 & Lưu trữ | 3* | 1 | 2** |
| VI — Vận hành | 0 | 2 | 2*** |

\* SharePoint, OneDrive, Teams, Email đã có code — cần env vars  
\*\* Ký số CA thật + Long-term archive  
\*\*\* Đào tạo user + Lập kế hoạch dự án (ngoài scope phần mềm)
