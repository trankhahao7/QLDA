# Hướng Dẫn Test Toàn Diện — Hệ Thống QLDA

> **Ngày viết:** 2026-05-31  
> **Môi trường:** localhost (Docker + Vite dev server)  
> **Tác giả:** icetruong

---

## Mục Lục

1. [Điều kiện tiên quyết](#1-điều-kiện-tiên-quyết)
2. [Kiểm tra hệ thống đang chạy](#2-kiểm-tra-hệ-thống-đang-chạy)
3. [Tài khoản test](#3-tài-khoản-test)
4. [Phase A — Authentication (Đăng nhập)](#4-phase-a--authentication)
5. [Phase B — Văn bản đến (Inbox)](#5-phase-b--văn-bản-đến)
6. [Phase C — Văn bản đi](#6-phase-c--văn-bản-đi)
7. [Phase D — Quy trình phê duyệt (Approvals)](#7-phase-d--quy-trình-phê-duyệt)
8. [Phase E — Hồ sơ (CaseFiles)](#8-phase-e--hồ-sơ)
9. [Phase F — Thông báo (Notifications)](#9-phase-f--thông-báo)
10. [Phase G — Ủy quyền (Delegation)](#10-phase-g--ủy-quyền)
11. [Phase H — Tìm kiếm (Search)](#11-phase-h--tìm-kiếm)
12. [Phase I — AI Chatbot](#12-phase-i--ai-chatbot)
13. [Phase J — Quản trị Admin](#13-phase-j--quản-trị-admin)
14. [Phase K — Báo cáo & Thống kê](#14-phase-k--báo-cáo--thống-kê)
15. [Phase L — Audit Log](#15-phase-l--audit-log)
16. [Phase M — API trực tiếp (curl / Postman)](#16-phase-m--api-trực-tiếp)
17. [Kịch bản End-to-End hoàn chỉnh](#17-kịch-bản-end-to-end-hoàn-chỉnh)
18. [Checklist tổng kết](#18-checklist-tổng-kết)

---

## 1. Điều Kiện Tiên Quyết

### 1.1 Dịch vụ phải đang chạy

```powershell
docker --context desktop-linux compose -f qlda-system/docker-compose.yml ps
```

Tất cả 10 container phải ở trạng thái **Up**:

| Container | Port | Vai trò |
|---|---|---|
| qlda-postgres | 5432 | PostgreSQL + pgvector |
| qlda-zookeeper | 2181 | Kafka coordinator |
| qlda-kafka | 9092, 29092 | Message broker |
| qlda-eureka-server | 8761 | Service discovery |
| qlda-auth-service | 8081 | Xác thực, người dùng |
| qlda-document-service | 8082 | Văn bản, file đính kèm |
| qlda-workflow-service | 8083 | Quy trình, phê duyệt |
| qlda-ai-service | 8084 | Tóm tắt, phân loại AI |
| qlda-notification-service | 8085 | Thông báo, báo cáo |
| qlda-api-gateway | 8080 | Entry point toàn hệ thống |

### 1.2 Frontend

```powershell
cd frontend && npm run dev
```

Frontend: **http://localhost:5173**

### 1.3 Khởi động lại nếu cần

```powershell
# Khởi động toàn bộ
docker --context desktop-linux compose -f qlda-system/docker-compose.yml up -d

# Rebuild một service cụ thể (ví dụ auth-service)
docker --context desktop-linux compose -f qlda-system/docker-compose.yml up -d --build auth-service
```

---

## 2. Kiểm Tra Hệ Thống Đang Chạy

Chạy các lệnh sau trước khi test bất cứ thứ gì:

### 2.1 Eureka Dashboard

Mở: **http://localhost:8761**

Kiểm tra 5 service đã đăng ký: `auth-service`, `document-service`, `workflow-service`, `ai-service`, `notification-service`.

### 2.2 Health check nhanh qua API Gateway

```bash
# Auth service
curl http://localhost:8080/api/auth/office365/config/status

# Kỳ vọng: {"success":true,"data":{"tenantId":"42350984...","clientId":"d6dac1af...","configured":true}}
```

```bash
# AI Chatbot (public endpoint)
curl -X POST http://localhost:8080/api/ai/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"xin chào","sessionId":"test-001"}'

# Kỳ vọng: {"reply":"...","success":true}
```

### 2.3 Kiểm tra logs nếu có lỗi

```powershell
docker --context desktop-linux logs qlda-auth-service --tail 30
docker --context desktop-linux logs qlda-api-gateway --tail 30
```

---

## 3. Tài Khoản Test

Các tài khoản có sẵn trong DB (từ `qlda_seed.sql`):

| username | Họ tên | Email | Vai trò | Ghi chú |
|---|---|---|---|---|
| `admin` | Administrator | 102230238@sv1.dut.udn.vn | ADMIN (ID: 1) | Toàn quyền |
| `nguyenvana` | Trần Khả Hào | trankhahao7@gmail.com | USER (ID: 2) | Chuyên viên |
| `truongdv` | Trương ĐV | truongdv@coquan.gov.vn | MANAGER (ID: 3) | Trưởng phòng |
| `icetruong` | Phan Van Truong | 102230222@sv1.dut.udn.vn | USER (ID: 2) | Azure AD chính |

> **Dev login** (không cần Azure): dùng `POST /api/auth/login/dev` với `{"username":"admin"}` để lấy token nhanh.

---

## 4. Phase A — Authentication

### A1. Đăng nhập Azure SSO (luồng chính)

1. Mở **http://localhost:5173**
2. Click **"Đăng nhập với Microsoft"**
3. Trình duyệt redirect sang `https://login.microsoftonline.com/42350984.../oauth2/v2.0/authorize`
4. Đăng nhập bằng tài khoản `102230222@sv1.dut.udn.vn` (hoặc `102230238@sv1.dut.udn.vn`)
5. Nếu lần đầu: màn hình consent hiện lên → click **Accept**
6. Trình duyệt redirect về `http://localhost:5173/auth/callback?code=...&state=...`
7. Frontend tự động gọi `POST /api/auth/login/azure`
8. ✅ **Kỳ vọng**: redirect sang `/dashboard`, hiện tên người dùng ở sidebar

**Kiểm tra sau đăng nhập:**
- Mở DevTools → Application → LocalStorage → kiểm tra key `access_token` tồn tại
- Tên user hiển thị đúng ở sidebar

### A2. Dev Login (không cần Azure)

```bash
curl -X POST http://localhost:8080/api/auth/login/dev \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

✅ **Kỳ vọng:** trả về `{"success":true,"data":{"accessToken":"eyJ...","refreshToken":"..."}}`

### A3. Refresh Token

```bash
# Lấy refreshToken từ bước A2, thay vào dưới đây
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken từ A2>"}'
```

✅ **Kỳ vọng:** trả về accessToken mới

### A4. Logout

1. Trên UI: click avatar → Đăng xuất
2. ✅ **Kỳ vọng**: redirect về `/login`, token bị xóa khỏi localStorage

### A5. Bảo mật — Truy cập không có token

```bash
curl http://localhost:8080/api/documents/incoming
# Kỳ vọng: 401 Unauthorized
```

```bash
curl http://localhost:8080/api/auth/users
# Kỳ vọng: 401 Unauthorized (không có token)
```

---

## 5. Phase B — Văn Bản Đến

> Trước khi test, lấy token Admin: xem bước A2 → lưu `$TOKEN`

### B1. Danh sách văn bản đến (UI)

1. Đăng nhập với tài khoản bất kỳ
2. Click **"Văn bản đến"** ở sidebar (route `/inbox`)
3. ✅ **Kỳ vọng**: danh sách hiển thị, có 2 văn bản mẫu (VB-001, VB-002) từ seed

### B2. Xem chi tiết văn bản

1. Click vào VB-001
2. ✅ **Kỳ vọng**: trang `/documents/5001` load đúng, hiển thị: số ký hiệu, trích yếu, đơn vị, ngày

### B3. Tạo văn bản đến mới (API)

```bash
TOKEN="<access_token từ A2>"

curl -X POST http://localhost:8080/api/documents/incoming \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soKyHieu": "TEST-001",
    "trichYeu": "Văn bản test đến",
    "loaiVanBanId": 1,
    "donViChuTriId": 1,
    "ngayVanBan": "2026-05-01",
    "ngayTiepNhan": "2026-05-02",
    "doMat": "Bình thường",
    "doKhan": "Trung bình",
    "hanXuLy": "2026-06-01"
  }'
```

✅ **Kỳ vọng:** `{"success":true,"data":{"id":...,"soKyHieu":"TEST-001"}}`

### B4. Upload file đính kèm

```bash
# Tạo file test
echo "Nội dung test" > test.txt

curl -X POST http://localhost:8080/api/documents/5001/attachments \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"
```

✅ **Kỳ vọng:** trả về `attachmentId`, `tenTep`

### B5. Chuyển xử lý (Transfer)

```bash
curl -X POST http://localhost:8080/api/documents/incoming/5001/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nguoiNhanId": 1002,
    "donViNhanId": 1,
    "ghiChu": "Chuyển để xử lý",
    "hanXuLy": "2026-06-15"
  }'
```

✅ **Kỳ vọng:** `{"success":true,"data":{"documentId":5001,...}}`

### B6. Upload trang (UI)

1. Vào `/upload`
2. Kéo thả file PDF/DOC vào vùng upload
3. ✅ **Kỳ vọng**: file được upload, hiện thông báo thành công

---

## 6. Phase C — Văn Bản Đi

### C1. Danh sách văn bản đi (UI)

1. Click **"Văn bản đi"** ở sidebar (route `/outgoing`)
2. ✅ **Kỳ vọng**: trang load, hiển thị bảng (có thể empty ban đầu)

### C2. Tạo văn bản đi

```bash
curl -X POST http://localhost:8080/api/documents/outgoing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soKyHieu": "OUT-TEST-001",
    "trichYeu": "Văn bản đi test phân bổ ngân sách",
    "loaiVanBanId": 1,
    "donViChuTriId": 1,
    "ngayVanBan": "2026-05-31",
    "doMat": "Bình thường",
    "doKhan": "Cao",
    "hanXuLy": "2026-06-30",
    "nguoiKy": "Trưởng phòng"
  }'
```

✅ **Kỳ vọng:** `{"success":true,"data":{"id":...}}`

### C3. Cập nhật văn bản đi

```bash
DOC_ID=<id từ C2>

curl -X PUT http://localhost:8080/api/documents/outgoing/$DOC_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soKyHieu": "OUT-TEST-001-REV",
    "trichYeu": "Văn bản đi test (đã cập nhật)",
    "loaiVanBanId": 1,
    "donViChuTriId": 1,
    "ngayVanBan": "2026-05-31",
    "doMat": "Bình thường",
    "doKhan": "Cao"
  }'
```

### C4. Submit phê duyệt

```bash
curl -X POST http://localhost:8080/api/documents/outgoing/$DOC_ID/submit-approval \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quyTrinhId": 1,
    "ghiChu": "Trình phê duyệt"
  }'
```

✅ **Kỳ vọng:** `{"success":true,"data":{"documentId":...,"workflowStatus":"PENDING"}}`

### C5. Tạo nháp (Draft)

```bash
curl -X POST http://localhost:8080/api/documents/drafts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trichYeu": "Nháp công văn phân bổ",
    "loaiVanBanId": 1,
    "noidung": "Nội dung nháp..."
  }'
```

---

## 7. Phase D — Quy Trình Phê Duyệt

### D1. Xem danh sách chờ duyệt (UI)

1. Đăng nhập tài khoản `truongdv` (MANAGER) hoặc `admin`
2. Click **"Phê duyệt"** ở sidebar (route `/approvals`)
3. ✅ **Kỳ vọng**: danh sách "Chờ duyệt" hiện (nếu đã submit ở C4)

### D2. Lấy danh sách pending (API)

```bash
curl "http://localhost:8080/api/workflows/approvals/pending?nguoiDuyetId=1001" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Kỳ vọng:** danh sách các approval đang chờ

### D3. Phê duyệt — Đồng ý

```bash
PROCESSING_ID=<lấy từ D2>

curl -X POST "http://localhost:8080/api/workflows/approvals/$PROCESSING_ID/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ghiChu": "Đồng ý phê duyệt",
    "nguoiDuyetId": 1001
  }'
```

✅ **Kỳ vọng:** `{"success":true,"data":{"action":"APPROVED",...}}`

### D4. Phê duyệt — Từ chối

```bash
curl -X POST "http://localhost:8080/api/workflows/approvals/$PROCESSING_ID/reject" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ghiChu": "Từ chối do thiếu tài liệu",
    "nguoiDuyetId": 1001
  }'
```

### D5. Thêm comment

```bash
curl -X POST "http://localhost:8080/api/workflows/approvals/$PROCESSING_ID/comment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ghiChu": "Cần bổ sung thêm thông tin",
    "nguoiDuyetId": 1001
  }'
```

### D6. Timeline theo dõi

```bash
DOC_ID=5001

curl "http://localhost:8080/api/workflows/documents/$DOC_ID/timeline" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Kỳ vọng:** mảng các bước đã qua, thời gian, người thực hiện

---

## 8. Phase E — Hồ Sơ

### E1. Xem danh sách hồ sơ (UI)

1. Click **"Hồ sơ"** ở sidebar (route `/case-files`)
2. ✅ **Kỳ vọng**: trang load, hiển thị danh sách

### E2. API lấy hồ sơ

```bash
curl "http://localhost:8080/api/documents/case-files" \
  -H "Authorization: Bearer $TOKEN"
```

### E3. Tạo hồ sơ

```bash
curl -X POST http://localhost:8080/api/documents/case-files \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maHoSo": "HS-2026-001",
    "tenHoSo": "Hồ sơ dự án A",
    "namLuu": 2026,
    "donViId": 1,
    "ghiChu": "Hồ sơ thử nghiệm"
  }'
```

---

## 9. Phase F — Thông Báo

### F1. Xem thông báo (UI)

1. Click chuông 🔔 ở topbar hoặc vào `/notifications`
2. ✅ **Kỳ vọng**: danh sách thông báo (in-app)

### F2. Lấy thông báo (API)

```bash
curl "http://localhost:8080/api/notifications?nguoiNhanId=1001&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### F3. Đánh dấu đã đọc

```bash
NOTIF_ID=<id từ F2>

curl -X PATCH "http://localhost:8080/api/notifications/$NOTIF_ID/read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nguoiNhanId": 1001}'
```

### F4. Tạo thông báo thủ công (API)

```bash
curl -X POST http://localhost:8080/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nguoiNhanId": 1002,
    "tieuDe": "Thông báo test",
    "noiDung": "Nội dung test notification",
    "loaiThongBao": "HE_THONG",
    "vanBanId": 5001
  }'
```

### F5. Gửi qua Teams Webhook (test thực tế)

```bash
NOTIF_ID=<id từ F4>

curl -X POST "http://localhost:8080/api/notifications/$NOTIF_ID/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "TEAMS"}'
```

✅ **Kỳ vọng:** tin nhắn xuất hiện trong Teams channel đã cấu hình Incoming Webhook

### F6. Gửi qua Email (SMTP)

```bash
curl -X POST "http://localhost:8080/api/notifications/$NOTIF_ID/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "EMAIL"}'
```

✅ **Kỳ vọng:** email gửi tới địa chỉ của `nguoiNhanId=1002` (trankhahao7@gmail.com)

---

## 10. Phase G — Ủy Quyền

### G1. Tạo ủy quyền (UI)

1. Vào `/delegation`
2. Click **"+ Tạo ủy quyền"**
3. Điền:
   - ID người được ủy quyền: `1002`
   - Từ ngày: `2026-06-01`
   - Đến ngày: `2026-06-30`
   - Phạm vi: `Ký duyệt công văn đến`
4. Click **"Tạo ủy quyền"**
5. ✅ **Kỳ vọng**: bảng cập nhật, hiện dòng mới với badge "Hiệu lực"

### G2. Tạo ủy quyền (API)

```bash
curl -X POST http://localhost:8080/api/workflows/delegations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nguoiUyQuyenId": 1001,
    "nguoiDuocUyQuyenId": 1002,
    "tuNgay": "2026-06-01",
    "denNgay": "2026-06-30",
    "phamViUyQuyen": "Ký duyệt công văn đến",
    "ghiChu": "Nghỉ phép"
  }'
```

### G3. Lấy danh sách ủy quyền

```bash
curl "http://localhost:8080/api/workflows/delegations?nguoiUyQuyenId=1001" \
  -H "Authorization: Bearer $TOKEN"
```

### G4. Hủy ủy quyền

```bash
DELEGATION_ID=<id từ G3>

curl -X DELETE "http://localhost:8080/api/workflows/delegations/$DELEGATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Kỳ vọng (UI):** badge chuyển sang "Hết hạn / Đã hủy"

---

## 11. Phase H — Tìm Kiếm

### H1. Tìm kiếm cơ bản (UI)

1. Vào `/search`
2. Gõ từ khóa "công văn" vào ô tìm kiếm
3. ✅ **Kỳ vọng**: kết quả trả về, khớp văn bản có từ này

### H2. Tìm kiếm semantic (AI)

```bash
curl -X POST http://localhost:8080/api/ai/search/semantic \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "văn bản về phân bổ kinh phí",
    "userId": 1001,
    "topK": 5
  }'
```

✅ **Kỳ vọng:** danh sách document chunks liên quan, ranked theo similarity

### H3. Tìm kiếm theo bộ lọc (API)

```bash
curl "http://localhost:8080/api/documents/incoming?keyword=kinh+phi&loaiVanBanId=1&trangThai=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 12. Phase I — AI Chatbot

### I1. Chat từ UI

1. Đăng nhập (token phải tồn tại)
2. Click icon **💬** chatbot ở góc phải màn hình
3. Gửi: `"Hướng dẫn tạo công văn mới"`
4. ✅ **Kỳ vọng**: AI trả lời bằng tiếng Việt về quy trình tạo công văn

### I2. Chat API (public, không cần auth)

```bash
curl -X POST http://localhost:8080/api/ai/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Làm thế nào để phê duyệt văn bản?",
    "sessionId": "test-session-001"
  }'
```

✅ **Kỳ vọng:** `{"reply":"...","success":true}`

### I3. Rate limit

```bash
# Gửi 6 request liên tiếp nhanh (giới hạn 5/phút/IP)
for i in 1 2 3 4 5 6; do
  curl -X POST http://localhost:8080/api/ai/chatbot/ask \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"test $i\",\"sessionId\":\"rate-test\"}"
done
```

✅ **Kỳ vọng:** request 6 trả về `429 Too Many Requests` với `"RATE_LIMITED"`

### I4. Tóm tắt văn bản (AI)

```bash
curl -X POST http://localhost:8080/api/ai/summarize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 5001,
    "userId": 1001,
    "content": "Văn bản về việc phân bổ kinh phí cho các dự án trọng điểm năm 2026 tổng cộng 5 tỷ đồng...",
    "summaryType": "brief",
    "language": "vi"
  }'
```

### I5. Phân loại văn bản (AI)

```bash
curl -X POST http://localhost:8080/api/ai/classify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 5001,
    "userId": 1001,
    "content": "Công văn về phân bổ kinh phí",
    "language": "vi"
  }'
```

---

## 13. Phase J — Quản Trị Admin

> Cần tài khoản `admin` (ADMIN role). Đăng nhập dev: `{"username":"admin"}`

### J1. Quản lý người dùng (UI)

1. Đăng nhập `admin`
2. Vào `/admin/users`
3. ✅ **Kỳ vọng**: danh sách 4 user từ seed hiện ra

### J2. Tạo người dùng mới

```bash
curl -X POST http://localhost:8080/api/auth/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser01",
    "hoTen": "Người Dùng Test",
    "email": "testuser01@coquan.gov.vn",
    "dienThoai": "0901234567",
    "donViId": 2,
    "chucVu": "Chuyên viên",
    "nhomQuyenId": 2
  }'
```

### J3. Cập nhật trạng thái user

```bash
USER_ID=<id từ J2>

curl -X PATCH "http://localhost:8080/api/auth/users/$USER_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trangThai": 0}'
```

✅ **Kỳ vọng:** user bị khóa, không đăng nhập được

### J4. Phân quyền

```bash
curl -X PATCH "http://localhost:8080/api/auth/users/$USER_ID/role" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nhomQuyenId": 1}'
```

### J5. Quản lý đơn vị

```bash
# Tạo đơn vị mới
curl -X POST http://localhost:8080/api/auth/don-vi \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maDonVi": "DV-004",
    "tenDonVi": "Phòng Tài chính",
    "dienThoai": "024-5555555",
    "email": "taichinh@coquan.gov.vn",
    "suDung": true
  }'
```

### J6. Quản lý loại văn bản (UI)

1. Vào `/admin/document-types`
2. ✅ **Kỳ vọng**: 3 loại từ seed hiện ra (Công văn, Biên bản, Đề xuất)

### J7. Quản lý quy trình (UI)

1. Vào `/admin/workflows`
2. Click vào "Quy trình công văn chuẩn"
3. ✅ **Kỳ vọng**: hiển thị 3 bước quy trình
4. Test tạo quy trình mới với 2 bước

### J8. Tạo workflow (API)

```bash
curl -X POST http://localhost:8080/api/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maQuyTrinh": "QTP-TEST",
    "tenQuyTrinh": "Quy trình test",
    "loaiVanBanId": 3,
    "mota": "Quy trình thử nghiệm",
    "suDung": true
  }'
```

### J9. Thêm bước vào workflow

```bash
WF_ID=<id từ J8>

curl -X POST "http://localhost:8080/api/workflows/$WF_ID/steps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenBuoc": "Bước duyệt test",
    "thuTuBuoc": 1,
    "vaiTroXuLy": "TRUONGPHONG",
    "thoiGianXuLy": 48,
    "batBuocPheDuyet": true
  }'
```

### J10. Quản lý template (UI)

1. Vào `/admin/templates`
2. Xem 2 template mẫu có sẵn
3. Test tạo template mới

### J11. SLA Management (UI)

1. Vào `/admin/sla`
2. ✅ **Kỳ vọng**: danh sách SLA rules theo workflow

### J12. SLA violations

```bash
curl "http://localhost:8080/api/workflows/sla/violations?fromDate=2026-01-01&toDate=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### J13. System Monitoring (UI)

1. Vào `/admin/monitoring`
2. ✅ **Kỳ vọng**: trang hiển thị trạng thái service (Up/Down), Kafka, DB

---

## 14. Phase K — Báo Cáo & Thống Kê

### K1. Dashboard báo cáo (UI)

1. Đăng nhập admin
2. Vào `/admin/reports`
3. ✅ **Kỳ vọng**: biểu đồ thống kê văn bản, trạng thái

### K2. Dashboard API

```bash
curl "http://localhost:8080/api/reports/dashboard?fromDate=2026-01-01&toDate=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Kỳ vọng:** JSON có `totalDocuments`, `pendingApprovals`, `overdueCount`, v.v.

### K3. Thống kê văn bản

```bash
curl "http://localhost:8080/api/reports/documents/statistics?fromDate=2026-01-01&toDate=2026-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

### K4. Tiến độ workflow

```bash
curl "http://localhost:8080/api/reports/workflows/progress?fromDate=2026-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

### K5. Văn bản quá hạn

```bash
curl "http://localhost:8080/api/reports/overdue-documents?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### K6. Xuất báo cáo

```bash
curl "http://localhost:8080/api/reports/export?reportType=documents&format=json&fromDate=2026-01-01&toDate=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 15. Phase L — Audit Log

### L1. Xem audit log (UI)

1. Vào `/admin/audit-logs`
2. ✅ **Kỳ vọng**: nhật ký hoạt động hệ thống (login, tạo văn bản, phê duyệt)

### L2. Lấy audit log (API)

```bash
curl "http://localhost:8080/api/audit-logs?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### L3. Lọc theo người dùng

```bash
curl "http://localhost:8080/api/audit-logs?nguoiDungId=1001&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### L4. Lọc theo khoảng thời gian

```bash
curl "http://localhost:8080/api/audit-logs?fromDate=2026-05-01T00:00:00&toDate=2026-05-31T23:59:59" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 16. Phase M — API Trực Tiếp (Postman Collection)

### M1. Chuỗi test nhanh bằng bash

```bash
# Bước 1: Đăng nhập lấy token
RESP=$(curl -s -X POST http://localhost:8080/api/auth/login/dev \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}')
TOKEN=$(echo $RESP | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
echo "TOKEN: $TOKEN"

# Bước 2: Lấy danh sách user
curl -s http://localhost:8080/api/auth/users \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Bước 3: Lấy danh sách văn bản đến
curl -s http://localhost:8080/api/documents/incoming \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Bước 4: Lấy danh sách workflow
curl -s http://localhost:8080/api/workflows \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Bước 5: Dashboard report
curl -s "http://localhost:8080/api/reports/dashboard" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### M2. Test Security — Non-admin không được vào /api/auth/users

```bash
# Đăng nhập với user thường
RESP=$(curl -s -X POST http://localhost:8080/api/auth/login/dev \
  -H "Content-Type: application/json" \
  -d '{"username":"nguyenvana"}')
USER_TOKEN=$(echo $RESP | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Thử truy cập user management
curl -s http://localhost:8080/api/auth/users \
  -H "Authorization: Bearer $USER_TOKEN"
# Kỳ vọng: 403 Forbidden
```

---

## 17. Kịch Bản End-to-End Hoàn Chỉnh

### Kịch bản 1: Tiếp nhận → Xử lý → Phê duyệt

```
1. [admin] Tạo văn bản đến: POST /api/documents/incoming
   → Ghi nhớ documentId

2. [admin] Chuyển xử lý cho nguyenvana:
   POST /api/documents/incoming/{id}/transfer
   body: {"nguoiNhanId":1002, "donViNhanId":1, "hanXuLy":"2026-06-30"}

3. [nguyenvana] Đăng nhập, vào /inbox
   → Thấy văn bản vừa được chuyển

4. [admin] Submit phê duyệt qua workflow:
   POST /api/documents/outgoing/{id}/submit-approval
   body: {"quyTrinhId":1}

5. [truongdv] Vào /approvals, thấy văn bản chờ duyệt
   POST /api/workflows/approvals/{processingId}/approve

6. [admin] Kiểm tra timeline:
   GET /api/workflows/documents/{id}/timeline
   → Thấy đủ 2 bước: Transfer + Approve

7. Kiểm tra notification:
   GET /api/notifications?nguoiNhanId=1002
   → Thấy thông báo "Văn bản đã được phê duyệt"
```

### Kịch bản 2: Văn bản đi → Phê duyệt → Phát hành

```
1. [nguyenvana] Tạo nháp: POST /api/documents/drafts

2. [nguyenvana] Chuyển thành văn bản đi:
   POST /api/documents/outgoing
   → documentId = X

3. [nguyenvana] Submit phê duyệt:
   POST /api/documents/outgoing/X/submit-approval

4. [truongdv] Phê duyệt:
   POST /api/workflows/approvals/{processingId}/approve

5. Kiểm tra trạng thái:
   GET /api/workflows/documents/X/status
   → trangThai: "APPROVED"
```

### Kịch bản 3: AI hỗ trợ xử lý văn bản

```
1. Upload file đính kèm cho VB-001:
   POST /api/documents/5001/attachments (multipart)

2. AI tóm tắt nội dung:
   POST /api/ai/summarize (content từ file)

3. AI gợi ý xử lý:
   POST /api/ai/suggestions/handling
   body: {"documentId":5001,"userId":1001,"content":"..."}

4. Chatbot hỏi về quy trình:
   POST /api/ai/chatbot/ask
   body: {"message":"Quy trình xử lý công văn đến gồm mấy bước?"}
```

---

## 18. Checklist Tổng Kết

### Hạ tầng

- [ ] 10 container Docker đang Up
- [ ] 5 service đăng ký trên Eureka (port 8761)
- [ ] Frontend chạy tại localhost:5173
- [ ] PostgreSQL nhận kết nối (port 5432)
- [ ] Kafka đang chạy (port 9092)

### Authentication

- [ ] Azure SSO login thành công (redirect + callback)
- [ ] Dev login trả về token hợp lệ
- [ ] Refresh token hoạt động
- [ ] Logout xóa token
- [ ] Truy cập không có token → 401
- [ ] User thường truy cập admin endpoint → 403

### Văn bản

- [ ] Tạo văn bản đến
- [ ] Upload file đính kèm
- [ ] Chuyển xử lý
- [ ] Tạo văn bản đi
- [ ] Submit phê duyệt

### Workflow

- [ ] Xem danh sách chờ duyệt
- [ ] Phê duyệt (approve)
- [ ] Từ chối (reject)
- [ ] Xem timeline

### Thông báo

- [ ] Thông báo in-app
- [ ] Đánh dấu đã đọc
- [ ] Teams webhook gửi được
- [ ] Email SMTP gửi được

### AI

- [ ] Chatbot trả lời (UI + API)
- [ ] Rate limit 429 sau 5 request
- [ ] Tóm tắt văn bản
- [ ] Phân loại văn bản

### Admin

- [ ] CRUD người dùng
- [ ] CRUD đơn vị
- [ ] CRUD quy trình + bước
- [ ] CRUD loại văn bản
- [ ] SLA violations
- [ ] System monitoring

### Báo cáo

- [ ] Dashboard report
- [ ] Document statistics
- [ ] Workflow progress
- [ ] Overdue documents
- [ ] Export report

### Audit

- [ ] Xem audit log
- [ ] Lọc theo user
- [ ] Lọc theo thời gian

---

## Ghi Chú Quan Trọng

| Vấn đề | Cách xử lý |
|---|---|
| 503 Service Unavailable | Đợi 15-30s sau rebuild để Eureka sync |
| 401 sau đăng nhập | Kiểm tra localStorage `access_token` |
| 500 khi tạo văn bản | Kiểm tra `loaiVanBanId`, `donViId` có tồn tại trong DB |
| Chatbot không trả lời | Kiểm tra `GEMINI_API_KEY` trong `.env` |
| Teams không nhận được | Kiểm tra `TEAMS_WEBHOOK_URL` trong `.env` |
| Email không gửi được | Kiểm tra `SPRING_MAIL_PASSWORD` trong `.env`, bật 2FA app password |
| Docker không chạy được | Chạy với `--context desktop-linux` |

---

*File này được tạo tự động dựa trên phân tích toàn bộ source code và cấu hình hệ thống QLDA.*
