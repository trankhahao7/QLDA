# eOIS — Việc cần làm (dành cho bạn)

> Cập nhật: 2026-05-31  
> Trạng thái code: Phase 1–6 hoàn thành ✅ | Chờ Azure/IT Admin ⚠️

---

## ✅ Đã hoàn thành (không cần làm gì thêm về code)

| Việc | Trạng thái |
|---|---|
| Migrations V003 (bảng UyQuyen) + V004 (cột OCR, AI) | ✅ Đã chạy |
| `GET /api/auth/office365/auth-url` endpoint | ✅ Implemented |
| `POST /api/auth/login/dev` chỉ chạy ngoài production (`@Profile("!prod")`) | ✅ Implemented |
| Rate limiting 10 req/phút per IP trên `/api/auth/login/**` | ✅ Implemented (in-memory) |
| CORS config trên API Gateway | ✅ Implemented |
| SlaScheduler + Unit tests | ✅ Implemented |
| SharePointService, TeamsNotificationSender, EmailNotificationSender | ✅ Code có sẵn — chỉ cần env vars |
| DigitalSignatureService skeleton | ✅ Code có sẵn |
| Delegation (UyQuyen) endpoints: POST/GET/DELETE /api/workflows/delegations | ✅ Implemented |
| All services running in Docker | ✅ Up |
| Frontend — Văn bản đi (`OutgoingDocuments.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Phê duyệt (`Approvals.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Thông báo (`Notifications.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Hồ sơ công việc (`CaseFiles.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Báo cáo & Thống kê (`Reports.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Quản lý SLA (`SlaManagement.tsx`) | ✅ Hoàn chỉnh |
| Frontend — Ủy quyền xử lý (`Delegation.tsx`) | ✅ Hoàn chỉnh (CSS fixed) |
| Routing + Sidebar cho tất cả trang mới | ✅ Done |

---

## 🔑 Việc bạn cần làm — Bảo mật khẩn cấp

| Việc | Lý do | Cách làm |
|---|---|---|
| **Rotate Gemini API key** | Đã lộ trong git history (commit c34f230) | Vào https://aistudio.google.com/app/apikey → tạo key mới → cập nhật `qlda-system/.env` |
| **Xác nhận `.gitignore`** bao gồm `qlda-system/.env` và `qlda-system/jwt-keys/` | Tránh commit secrets | Chạy `git check-ignore qlda-system/.env qlda-system/jwt-keys/private.pem` |
| **Rotate JWT key pair** | `jwt-keys/` có thể đã bị track bởi git | Tạo key pair mới: `openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem` |

---

## 🟡 Cần cấu hình để mở khoá tính năng (code đã có)

### Azure Active Directory — SSO & Office 365

Thêm vào `qlda-system/.env`:

```env
AZURE_TENANT_ID=<từ Azure Portal>
AZURE_CLIENT_ID=<từ Azure Portal>
AZURE_CLIENT_SECRET=<từ Azure Portal>
AZURE_REDIRECT_URI=http://localhost:5173

OFFICE365_TENANT_ID=<từ Azure Portal>
OFFICE365_CLIENT_ID=<từ Azure Portal>
OFFICE365_CLIENT_SECRET=<từ Azure Portal>
```

Yêu cầu IT Admin:
1. Tạo Azure App Registration
2. Cấp API Permissions: `User.Read`, `Mail.Send`, `Files.ReadWrite`, `Sites.ReadWrite.All`, `ChannelMessage.Send`
3. Bật admin consent

### SharePoint lưu trữ văn bản

```env
SHAREPOINT_ENABLED=true
SHAREPOINT_SITE_ID=<lấy qua graph.microsoft.com/v1.0/sites>
```

### Teams Notification

```env
TEAMS_WEBHOOK_URL=<tạo trong Teams Admin Center → Incoming Webhook>
```

### Email (Outlook SMTP)

```env
SPRING_MAIL_HOST=smtp.office365.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=<email hệ thống>
SPRING_MAIL_PASSWORD=<app password hoặc OAuth>
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
```

---

## 🟠 Cần làm thêm về code (chưa implement)

### 1. Ký số CA thật (bỏ qua nếu không cần)

`DigitalSignatureService` hiện dùng SHA-256 local. Nếu cần ký số pháp lý:
- Tích hợp VNPT CA hoặc Viettel CA API
- Thêm bảng `ChuKySo` trong database
- Nhúng chữ ký số vào file PDF

### 2. OCR Engine thật

`processOcr` hiện gọi AI service qua Feign. Nếu muốn OCR thật:
- Chọn: Tesseract (miễn phí, thêm `tess4j` dependency) hoặc Azure AI Vision (trả phí)
- Test với file PDF/image văn bản hành chính thật

### 3. Rate limiting bằng Redis (production)

`AuthRateLimitFilter` hiện dùng in-memory (mất trạng thái khi restart, không scale multi-instance).
- Thêm Redis vào `docker-compose.yml`
- Chuyển sang `RedisRateLimiter` của Spring Cloud Gateway

### 4. Frontend — đã kiểm tra (cập nhật 2026-05-31)

Tất cả các trang đã có UI đầy đủ và được kết nối vào routing + Sidebar:

| Trang | File | Trạng thái | Ghi chú |
|---|---|---|---|
| Văn bản đi | `OutgoingDocuments.tsx` | ✅ Hoàn chỉnh | List + filter (trạng thái, ngày) + form tạo + export CSV |
| Phê duyệt | `Approvals.tsx` | ✅ Hoàn chỉnh | Queue của user + Duyệt/Từ chối/Ghi chú modal |
| Thông báo | `Notifications.tsx` | ✅ Hoàn chỉnh | All/Unread tab + badge số chưa đọc + đánh dấu đã đọc |
| Hồ sơ công việc | `CaseFiles.tsx` | ✅ Hoàn chỉnh | Tạo + tìm kiếm + gắn văn bản + xóa |
| Báo cáo & Thống kê | `Reports.tsx` | ✅ Hoàn chỉnh | StatCards + BarChart + tiến độ workflow + bảng quá hạn + export CSV |
| Quản lý SLA | `SlaManagement.tsx` | ✅ Hoàn chỉnh | Chọn quy trình → xem/sửa SLA từng bước |
| Ủy quyền xử lý | `Delegation.tsx` | ✅ Hoàn chỉnh | Tạo/xem/hủy ủy quyền (CSS đã fix 2026-05-31) |

**CSS đã fix:** `Delegation.tsx` trước dùng class names không tồn tại (`page-container`, `button primary`, `empty-state`, v.v.) → đã thay bằng class names của dự án (`section`, `topbar`, `card`, `button`, v.v.)

---

## 📋 Checklist trước Demo / Production

- [x] V003 + V004 migrations đã chạy
- [x] Tất cả services rebuild thành công
- [ ] Azure App Registration đã tạo (cần IT Admin)
- [ ] CORS `allowed-origins` cập nhật thành production domain
- [ ] `SHAREPOINT_ENABLED=false` nếu chưa có Azure (hoặc `true` nếu đã config)
- [ ] `auth.dev-password.enabled=false` trong production profile
- [ ] Gemini API key đã rotate
- [ ] JWT key pair đã rotate (private.pem, public.pem)
- [ ] Swagger UI tắt production (`springdoc.swagger-ui.enabled=false`)
- [ ] HTTPS enforcement tại reverse proxy (TLS 1.2+)
- [ ] Chạy OWASP ZAP baseline scan trên staging

---

## 📊 Trạng thái 43 chức năng (cập nhật 2026-05-31)

| Nhóm | Done | Partial | Missing |
|---|---|---|---|
| I — Quản trị & bảo mật | 4 | 3 | 0 |
| II — Nghiệp vụ văn bản | 7 | 3 | 0 |
| III — Luồng công việc | 6 | 2 | 0 |
| IV — AI Agent | 6 | 0 | 0 |
| V — Office 365 & Lưu trữ | 4* | 1 | 1** |
| VI — Vận hành | 0 | 2 | 2*** |

\* SharePoint, OneDrive, Teams, Email code có sẵn — chỉ cần env vars + Azure App Registration  
\*\* Kho lưu trữ dài hạn (long-term archive) — cần sau khi có SharePoint  
\*\*\* Đào tạo user + Lập kế hoạch dự án (ngoài scope phần mềm)
