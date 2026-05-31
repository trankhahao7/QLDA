# Hướng Dẫn Test & Demo — Hệ Thống eOIS

> **Cập nhật:** 2026-06-01  
> **Mục tiêu:** Test toàn bộ chức năng UI trước buổi demo, không cần Postman/curl.  
> **Thời gian ước tính:** 45–60 phút toàn luồng.

---

## Tài Khoản Cần Dùng

| # | Email | Vai trò | Dùng để |
|---|-------|---------|---------|
| **TK1** | `102230222@sv1.dut.udn.vn` | Chuyên viên (USER) | Tạo văn bản, upload, ủy quyền, thông báo |
| **TK2** | `102230238@sv1.dut.udn.vn` | Quản trị viên (ADMIN) | Phê duyệt, quản trị, báo cáo |

**Cách mở 2 phiên song song:** Chrome bình thường (TK2) + Incognito Ctrl+Shift+N (TK1).

---

## Điều Kiện Tiên Quyết

1. **Docker Desktop** — tất cả container `qlda-*` đang **Running**
2. **Frontend** — `cd frontend && npm run dev` → mở `http://localhost:5173`
3. **Kiểm tra nhanh** — `http://localhost:8761` phải thấy ≥ 5 service đã đăng ký

---

## Sơ Đồ Luồng Demo Nhanh

```
[TK1 - Chuyên viên]                    [TK2 - Admin]
        │                                      │
  Đăng nhập                            Đăng nhập
        │                                      │
  Tạo văn bản nội bộ                   Xem & phê duyệt văn bản đi
        │                                      │
  Tạo văn bản đi (+ đính kèm file)    Xem báo cáo + top nhân viên
        │                                      │
  Submit phê duyệt                     SLA → tab "Sắp hết hạn"
        │                                      │
  Nhận thông báo → click → navigate    Audit log
        │                                      │
  Xem lịch sử hồ sơ (timeline)        Xem audit log (giờ hiển thị đúng)
        │                                      │
  Tạo ủy quyền                         ─────────
        │
  Chatbot AI / Tìm kiếm
```

---

## PHẦN 1 — ĐĂNG NHẬP

### 1.1 — TK2 (Admin) — Cửa sổ thường

1. Mở Chrome → `http://localhost:5173`
2. Click **"Đăng nhập với Microsoft"**
3. Đăng nhập `102230238@sv1.dut.udn.vn` — lần đầu bấm **Accept**
4. ✅ Vào Dashboard, sidebar hiển thị tên Admin

### 1.2 — TK1 (Chuyên viên) — Incognito

1. Ctrl+Shift+N → `http://localhost:5173`
2. Đăng nhập `102230222@sv1.dut.udn.vn`
3. ✅ Vào Dashboard, sidebar hiển thị tên Chuyên viên

> Từ đây: **Cửa sổ thường = Admin (TK2)**, **Incognito = Chuyên viên (TK1)**

---

## PHẦN 2 — SIDEBAR & ĐIỀU HƯỚNG (MỚI)

*Thực hiện tại bất kỳ cửa sổ nào*

### 2.1 — Thu gọn / Mở rộng sidebar

1. Nhìn vào thanh sidebar, thấy nút **◀** ở góc phải header sidebar
2. Click **◀** → sidebar thu gọn (chỉ hiện icon, không hiện chữ)
3. Hover lên từng icon → tooltip hiện tên menu
4. Click **▶** → sidebar mở rộng trở lại
5. ✅ Badge thông báo 🔔 vẫn hiển thị đúng khi thu gọn

### 2.2 — Menu "Văn bản nội bộ" *(Mới)*

1. Sidebar ở chế độ mở rộng
2. Thấy mục **🏢 Văn bản nội bộ** (nằm giữa "Văn bản đi" và "Ủy quyền xử lý")
3. Click → vào `/internal-documents`
4. ✅ Trang hiển thị đúng, không lỗi

---

## PHẦN 3 — VĂN BẢN ĐẾN

*Cửa sổ Incognito (TK1)*

### 3.1 — Xem danh sách

1. Click **📥 Văn bản đến** → `/inbox`
2. ✅ Bảng danh sách tải được, cột nội dung truncate dấu `...` nếu quá dài

### 3.2 — Xem chi tiết văn bản

1. Click vào tên (link xanh) một văn bản bất kỳ
2. ✅ Trang `/documents/:id` hiển thị đầy đủ

### 3.3 — Luân chuyển văn bản

1. Quay lại `/inbox`, click **"Luân chuyển"** ở một dòng
2. Modal hiện ra: chọn người nhận, điền nội dung, hạn xử lý
3. Click **"Xác nhận luân chuyển"**
4. ✅ Thông báo thành công, văn bản biến khỏi danh sách

---

## PHẦN 4 — VĂN BẢN NỘI BỘ *(Tính năng mới)*

*Cửa sổ Incognito (TK1)*

### 4.1 — Xem danh sách

1. Click **🏢 Văn bản nội bộ** → `/internal-documents`
2. ✅ Trang tải được (ban đầu có thể rỗng — hiển thị empty state)

### 4.2 — Tạo văn bản nội bộ mới

1. Click **"+ Tạo văn bản nội bộ"** (góc phải trên)
2. Modal popup hiện ra
3. Điền:
   - **Trích yếu:** `Thông báo nội bộ về quy trình làm việc mới`
   - **Số ký hiệu:** `TB-NB-001`
   - **Loại văn bản:** chọn từ dropdown
   - **Người ký:** `Trưởng phòng Hành chính`
   - **Ngày văn bản:** chọn ngày hôm nay
   - **Độ khẩn:** Bình thường
   - **Độ mật:** Nội bộ
4. Click **"Tạo văn bản"**
5. ✅ Thông báo thành công, modal đóng, danh sách cập nhật có văn bản mới

### 4.3 — Lọc theo trạng thái

1. Dùng dropdown "Tất cả trạng thái" → chọn "Nháp"
2. Click **"Lọc"**
3. ✅ Chỉ hiển thị văn bản trạng thái Nháp

---

## PHẦN 5 — VĂN BẢN ĐI *(Cập nhật: có đính kèm file)*

*Cửa sổ Incognito (TK1)*

### 5.1 — Xem danh sách

1. Click **📤 Văn bản đi** → `/outgoing`
2. ✅ Bảng hiển thị, badge màu sắc trạng thái đúng

### 5.2 — Tạo văn bản đi và đính kèm file *(Tính năng mới)*

1. Click **"+ Tạo văn bản đi"**
2. Điền form:
   - **Trích yếu:** `Công văn đề nghị phân bổ kinh phí quý 3`
   - **Số ký hiệu:** `CV-TEST-001`
   - **Loại văn bản:** chọn từ dropdown
   - **Người ký:** `Giám đốc`
   - **Ngày văn bản:** chọn ngày hôm nay
   - **Độ khẩn:** Bình thường
3. **Tại trường "Tệp đính kèm":** click chọn file, chọn một file PDF/DOCX bất kỳ
4. ✅ Tên file hiện ra trong danh sách kèm trạng thái "chờ"
5. Click thêm một file nữa (thử đính kèm 2 file)
6. Muốn bỏ file: click **✕** bên cạnh tên file
7. Click **"Tạo văn bản"**
8. ✅ Văn bản được tạo, các file upload tuần tự (thấy trạng thái "..." → "✓")
9. ✅ Sau 1 giây modal đóng, danh sách cập nhật

### 5.3 — Xuất CSV

1. Click **"Xuất CSV"** (góc trên phải)
2. ✅ File CSV tải về máy, mở ra thấy dữ liệu đúng

---

## PHẦN 6 — PHÊ DUYỆT

### 6.1 — Xem danh sách (TK2 - Admin, cửa sổ thường)

1. Click **✅ Phê duyệt** → `/approvals`
2. ✅ Danh sách văn bản đang chờ phê duyệt hiển thị

### 6.2 — Phê duyệt — Đồng ý

1. Ở một dòng văn bản, click **"Duyệt"** (nút xanh)
2. Modal "✅ Phê duyệt văn bản" hiện ra
3. Điền ý kiến: `Đồng ý phê duyệt`
4. Click **"Xác nhận phê duyệt"**
5. ✅ Thông báo "Thao tác thành công!", dòng biến khỏi danh sách sau 1 giây

### 6.3 — Từ chối

1. Ở dòng khác, click **"Từ chối"** (nút đỏ)
2. **Bắt buộc điền** lý do: `Thiếu tài liệu kèm theo, cần bổ sung`
3. Click **"Xác nhận từ chối"**
4. ✅ Thành công, dòng biến khỏi danh sách

### 6.4 — Ghi chú

1. Click **"Ghi chú"** ở một dòng
2. Điền: `Vui lòng bổ sung phụ lục trước khi duyệt`
3. Click **"Gửi ghi chú"**
4. ✅ Thành công, văn bản vẫn ở danh sách (ghi chú không xóa khỏi hàng đợi)

---

## PHẦN 7 — THÔNG BÁO *(Cập nhật: click thông báo tự navigate)*

*Cửa sổ Incognito (TK1)*

### 7.1 — Xem thông báo

1. Click **🔔 Thông báo** → `/notifications`
2. ✅ Danh sách thông báo hiển thị (sau khi phê duyệt ở Phần 6, TK1 nhận được thông báo)

### 7.2 — Lọc chưa đọc

1. Click tab **"Chưa đọc"**
2. ✅ Chỉ hiện thông báo chưa đọc, badge số cập nhật đúng

### 7.3 — Click thông báo → Tự navigate *(Tính năng mới)*

1. Tìm thông báo loại **"Phê duyệt"** hoặc **"Luân chuyển"**
2. Click vào dòng thông báo đó
3. ✅ Trình duyệt **tự động chuyển trang**:
   - Thông báo phê duyệt → chuyển đến `/approvals`
   - Thông báo về văn bản cụ thể → chuyển đến `/documents/{id}`
4. ✅ Thông báo đồng thời được đánh dấu đã đọc

### 7.4 — Đánh dấu tất cả đã đọc

1. Quay lại `/notifications`
2. Click **"Đánh dấu tất cả đã đọc"**
3. ✅ Tất cả thông báo đổi sang nền trắng (đã đọc)

### 7.5 — Xóa thông báo

1. Click **✕** bên phải một thông báo
2. ✅ Thông báo biến khỏi danh sách ngay lập tức

---

## PHẦN 8 — HỒ SƠ CÔNG VIỆC *(Cập nhật: có timeline lịch sử)*

*Cửa sổ Incognito (TK1)*

### 8.1 — Xem danh sách

1. Click **🗂️ Hồ sơ công việc** → `/case-files`
2. ✅ Danh sách hồ sơ hiển thị

### 8.2 — Tạo hồ sơ mới

1. Click **"+ Tạo hồ sơ mới"**
2. Điền:
   - **Mã hồ sơ:** `HS-TEST-2026`
   - **Tên hồ sơ:** `Hồ sơ dự án thử nghiệm 2026`
   - **Đơn vị phụ trách:** chọn từ dropdown
3. Click **"Tạo hồ sơ"**
4. ✅ Hồ sơ xuất hiện trong danh sách với badge "Đang mở"

### 8.3 — Xem lịch sử xử lý (Timeline) *(Tính năng mới)*

1. Ở dòng bất kỳ, click nút **"Lịch sử"** (màu xanh)
2. Modal **"📋 Lịch sử xử lý"** hiện ra
3. ✅ Hiển thị thông tin hồ sơ và số ký hiệu văn bản liên kết
4. ✅ Timeline dọc hiện các bước xử lý (chấm xanh = hoàn thành, chấm xám = chưa)
5. Mỗi bước hiển thị: tên bước, người xử lý, hành động, ý kiến, ngày nhận/hoàn thành
6. Nếu chưa có lịch sử → hiển thị empty state "Chưa có lịch sử xử lý"
7. Click **"Đóng"** hoặc click ngoài modal để thoát
8. ✅ Modal đóng bình thường

### 8.4 — Gắn văn bản vào hồ sơ

1. Ở dòng hồ sơ, click **"Gắn VB"**
2. Điền ID văn bản (lấy từ URL khi xem chi tiết văn bản, ví dụ: `1`)
3. Click **"Xác nhận gắn"**
4. ✅ Thành công

---

## PHẦN 9 — ỦY QUYỀN *(Cập nhật: popup modal)*

*Cửa sổ Incognito (TK1)*

### 9.1 — Xem danh sách ủy quyền

1. Click **🤝 Ủy quyền xử lý** → `/delegation`
2. ✅ Trang tải được, bảng hiển thị (có thể rỗng)

### 9.2 — Tạo ủy quyền mới

1. Click **"+ Tạo ủy quyền"** (góc phải trên)
2. ✅ **Popup modal** hiện ra (không phải form inline)
3. Điền:
   - **Người được ủy quyền:** chọn từ dropdown (hiển thị họ tên + đơn vị)
   - **Từ ngày:** ngày mai
   - **Đến ngày:** một tuần sau
   - **Phạm vi ủy quyền:** `Ký duyệt công văn đến trong thời gian nghỉ phép`
   - **Ghi chú:** `Nghỉ phép 5 ngày`
4. Click **"Tạo ủy quyền"**
5. ✅ Modal đóng, bảng cập nhật, dòng mới có badge **"Hiệu lực"**
6. Cột "Người được ủy quyền" hiển thị **họ tên + đơn vị** (không phải số ID thô)

### 9.3 — Hủy ủy quyền

1. Ở dòng ủy quyền đang "Hiệu lực", click **"Hủy"**
2. Xác nhận trong hộp thoại
3. ✅ Badge đổi sang "Hết hạn / Đã hủy"

---

## PHẦN 10 — UPLOAD VĂN BẢN

*Cửa sổ Incognito (TK1)*

### 10.1 — Upload file

1. Click **⬆️ Tải lên** → `/upload`
2. Kéo file PDF/DOCX vào vùng upload (hoặc click chọn file)
3. Điền: Số ký hiệu `VB-UP-001`, Trích yếu, Loại văn bản, Ngày tiếp nhận
4. Click **"Upload"** / **"Lưu"**
5. ✅ Upload thành công, file xuất hiện trong `/inbox`

---

## PHẦN 11 — TÌM KIẾM

*Cửa sổ Incognito (TK1)*

### 11.1 — Tìm kiếm cơ bản

1. Click **🔍 Tìm kiếm** → `/search`
2. Gõ `công văn` → nhấn Enter
3. ✅ Kết quả hiển thị các văn bản khớp

### 11.2 — Tìm kiếm với bộ lọc

1. Thêm bộ lọc: Loại văn bản, Trạng thái, Khoảng thời gian
2. ✅ Kết quả thu hẹp theo điều kiện

---

## PHẦN 12 — AI CHATBOT

*Bất kỳ cửa sổ nào*

### 12.1 — Mở chatbot

1. Click icon **💬** ở góc dưới phải màn hình
2. ✅ Hộp chat mở ra

### 12.2 — Test câu hỏi

| Câu hỏi | Kết quả mong đợi |
|---------|-----------------|
| `Hướng dẫn tạo công văn mới` | Trả lời bằng tiếng Việt, giải thích các bước |
| `Làm thế nào để tìm văn bản theo ngày?` | Hướng dẫn dùng trang Tìm kiếm |
| `Thời tiết hôm nay thế nào?` | Từ chối hoặc nói chỉ hỗ trợ nghiệp vụ văn phòng |

---

## PHẦN 13 — QUẢN TRỊ ADMIN

*Cửa sổ thường (TK2 - Admin)*

### 13.1 — Quản lý người dùng (`/admin/users`)

1. Vào menu Admin → Người dùng
2. ✅ Danh sách user hiển thị
3. **Tạo user:** `+ Thêm` → điền Username, Họ tên, Email, Đơn vị, Vai trò → Lưu → ✅ xuất hiện trong danh sách
4. **Khóa user:** click toggle trạng thái → ✅ badge đổi "Không hoạt động"

### 13.2 — Quản lý đơn vị (`/admin/units`)

1. ✅ Danh sách phòng ban hiển thị
2. **Tạo:** `+ Thêm` → Mã `DV-TEST`, Tên `Phòng Test` → Lưu → ✅ xuất hiện

### 13.3 — Loại văn bản (`/admin/document-types`)

1. ✅ Danh sách loại văn bản hiển thị
2. **Tạo:** `+ Thêm` → điền Mã, Tên, Mô tả → Lưu → ✅ xuất hiện

### 13.4 — Quy trình xử lý (`/admin/workflows`)

1. ✅ Danh sách quy trình hiển thị
2. Click vào một quy trình → xem danh sách bước
3. **Tạo quy trình:** `+ Thêm` → Mã `QT-TEST`, Tên, Loại văn bản → Lưu
4. **Thêm bước:** vào quy trình → `+ Thêm bước` → Tên bước, Thứ tự, Thời gian → Lưu → ✅ bước mới hiện

### 13.5 — Mẫu văn bản (`/admin/templates`)

1. ✅ Danh sách mẫu hiển thị
2. Tạo mẫu mới → ✅ xuất hiện trong danh sách

### 13.6 — Phân quyền (`/admin/permissions`)

1. ✅ Danh sách nhóm quyền hiển thị (ADMIN, USER, LANH_DAO, v.v.)

---

## PHẦN 14 — QUẢN LÝ SLA *(Cập nhật: tab "Sắp hết hạn" mới)*

*Cửa sổ thường (TK2 - Admin)*

### 14.1 — Xem cấu hình SLA

1. Admin → **Quản lý SLA** → `/admin/sla`
2. Chọn một quy trình từ dropdown "Chọn quy trình"
3. ✅ Tab **"Cấu hình SLA"** hiện bảng thời gian xử lý từng bước

### 14.2 — Chỉnh sửa SLA

1. Ở một bước, click **"Chỉnh sửa"**
2. Sửa thời gian (ví dụ: `2` → `3`), đổi đơn vị sang "Ngày"
3. Click **"Lưu"**
4. ✅ Giá trị cập nhật ngay, không reload trang

### 14.3 — Xem vi phạm SLA

1. Click tab **"Vi phạm SLA"**
2. ✅ Danh sách văn bản quá hạn (nếu có) hoặc "Không có vi phạm SLA ✅"

### 14.4 — Xem văn bản sắp hết hạn *(Tính năng mới)*

1. Click tab **"Sắp hết hạn"** (có thể hiển thị màu vàng nếu có dữ liệu)
2. ✅ Danh sách văn bản còn ≤ 2 ngày đến hạn xử lý
3. Mỗi dòng hiển thị: Mã văn bản, Nội dung, Người gửi, Hạn xử lý (màu vàng/đỏ), Badge trạng thái (Còn X ngày / Hôm nay / Quá hạn)
4. Click **"🔄 Làm mới"** → danh sách tải lại

---

## PHẦN 15 — KIỂM TRA HEALTH ENDPOINT

*Bất kỳ trình duyệt nào*

### 15.1 — Kiểm tra AI service

1. Truy cập trực tiếp: `http://localhost:8080/api/ai/health`
2. ✅ Response JSON: `{"status": "UP"}` (hoặc tương tự)

> Lưu ý: menu "Giám sát hệ thống" đã được ẩn khỏi sidebar Admin để giao diện gọn hơn.

---

## PHẦN 16 — BÁO CÁO & THỐNG KÊ *(Cập nhật: bảng top nhân viên)*

*Cửa sổ thường (TK2 - Admin)*

### 16.1 — Xem tổng quan báo cáo

1. Admin → **Thống kê & Báo cáo** → `/admin/reports`
2. ✅ Các thẻ thống kê hiển thị: Tổng văn bản, Văn bản đến, Văn bản đi, Đã xử lý, Đang xử lý, Quá hạn, Tỉ lệ hoàn thành %

### 16.2 — Xem top nhân viên *(Tính năng mới)*

1. ✅ Section **"Top nhân viên xử lý nhiều nhất"** hiển thị bên dưới biểu đồ tiến độ
2. Bar chart ngang với: số thứ tự (vàng = top 1–3), tên nhân viên, thanh màu, số lượng nhiệm vụ
3. ✅ Nếu không có dữ liệu workflow đang xử lý → section này ẩn (không hiện rỗng)

### 16.3 — Biểu đồ theo tháng

1. ✅ Section "Số văn bản theo tháng" với bar chart ngang hiển thị (nếu có dữ liệu)

### 16.4 — Lọc theo thời gian

1. Chọn **Từ ngày** và **Đến ngày** ở filter phía trên
2. Click **"Lọc"**
3. ✅ Số liệu cập nhật theo khoảng thời gian

### 16.5 — Xuất báo cáo

1. Click **"Xuất CSV"** → ✅ file tải về, có tiêu đề và giá trị
2. Click **"Xuất Excel"** → ✅ file tải về (hoặc fallback)

### 16.6 — Văn bản quá hạn

1. ✅ Section "Văn bản quá hạn chưa xử lý" (nếu có dữ liệu)

---

## PHẦN 17 — NHẬT KÝ HOẠT ĐỘNG

*Cửa sổ thường (TK2 - Admin)*

### 17.1 — Xem nhật ký

1. Admin → **Nhật ký hoạt động** → `/admin/audit-logs`
2. ✅ Danh sách hành động: đăng nhập, tạo văn bản, phê duyệt, v.v. kèm thời gian và người thực hiện
3. ✅ Thời gian hiển thị đúng giờ Việt Nam (UTC+7) — ví dụ: đăng nhập lúc 12:39 AM hiện đúng "12:39" không phải "17:39"

### 17.2 — Lọc nhật ký

1. Dùng bộ lọc theo người dùng / thời gian / loại hành động
2. ✅ Danh sách thu hẹp theo điều kiện

---

## PHẦN 18 — HỒ SƠ CÁ NHÂN & ĐĂNG XUẤT

### 18.1 — Hồ sơ cá nhân (TK1)

1. Click **👤 Tài khoản** → `/profile`
2. ✅ Hiển thị: họ tên, email, đơn vị, vai trò

### 18.2 — Đăng xuất

1. Click **"Đăng xuất"** ở profile hoặc sidebar
2. ✅ Chuyển về `/login`, gõ `/dashboard` vào URL → redirect về login

---

## Kịch Bản End-to-End Nhanh (Dùng Để Demo)

```
[1] Đăng nhập 2 tài khoản trên 2 cửa sổ

[2] TK1 - Thu gọn/mở rộng sidebar (demo collapse)

[3] TK1 - Tạo văn bản nội bộ
    → /internal-documents → "+ Tạo văn bản nội bộ" → điền form → Tạo

[4] TK1 - Tạo văn bản đi với đính kèm file
    → /outgoing → "+ Tạo văn bản đi" → điền form → chọn file đính kèm → Tạo
    → Quan sát trạng thái upload file (chờ → ... → ✓)

[5] TK2 - Phê duyệt văn bản
    → /approvals → "Duyệt" → ghi ý kiến → Xác nhận

[6] TK1 - Nhận thông báo → click navigate
    → /notifications → click thông báo phê duyệt → tự chuyển trang

[7] TK1 - Xem lịch sử hồ sơ
    → /case-files → tạo hồ sơ → click "Lịch sử" → xem timeline modal

[8] TK1 - Tạo ủy quyền qua popup
    → /delegation → "+ Tạo ủy quyền" → popup → chọn người → Tạo
    → Xem bảng có tên người thay vì ID số

[9] TK2 - Xem SLA + tab "Sắp hết hạn"
    → /admin/sla → chọn quy trình → click tab "Sắp hết hạn"

[10] TK2 - Xem báo cáo + top nhân viên
     → /admin/reports → xem section "Top nhân viên xử lý nhiều nhất"

[11] TK1 - AI Chatbot
     → Click 💬 → hỏi về quy trình

[12] TK1 - Tìm kiếm
     → /search → gõ từ khóa → lọc kết quả
```

---

## Checklist Nhanh Trước Demo

### Hạ tầng
- [ ] Docker: tất cả `qlda-*` container đang Running
- [ ] `http://localhost:5173` mở được
- [ ] `http://localhost:8761` thấy ≥ 5 service đã đăng ký
- [ ] `http://localhost:8080/api/ai/health` trả về `{"status":"UP"}`

### Đăng nhập
- [ ] TK1 đăng nhập thành công vào Dashboard
- [ ] TK2 đăng nhập thành công vào Dashboard
- [ ] Đăng xuất → redirect `/login`

### Tính năng mới (ưu tiên demo)
- [ ] Sidebar thu gọn/mở rộng hoạt động
- [ ] `/internal-documents` tải được, tạo văn bản nội bộ thành công
- [ ] Tạo văn bản đi với file đính kèm → file upload ✓
- [ ] Click thông báo → tự navigate đúng trang
- [ ] Hồ sơ → nút "Lịch sử" → modal timeline hiển thị
- [ ] Ủy quyền → popup modal (không phải form inline), cột tên người (không phải ID)
- [ ] SLA → tab "Sắp hết hạn" có data hoặc empty state đúng
- [ ] Reports → section "Top nhân viên" hiển thị (nếu có workflow data)

### Tính năng cũ (kiểm tra không bị regression)
- [ ] `/inbox` tải được, luân chuyển được
- [ ] `/upload` upload file thành công
- [ ] `/approvals` duyệt / từ chối / ghi chú được
- [ ] `/search` tìm kiếm được
- [ ] Chatbot 💬 trả lời được
- [ ] `/admin/users` tạo + khóa user được
- [ ] `/admin/workflows` xem + tạo quy trình được
- [ ] `/admin/reports` xem thống kê, xuất CSV được
- [ ] `/admin/audit-logs` xem nhật ký được

---

## Xử Lý Sự Cố Thường Gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
|--------|-------------|------------|
| Trang trắng sau đăng nhập | Token không hợp lệ | F12 → Application → Clear site data → đăng nhập lại |
| "Lỗi đăng nhập Azure" | Container auth-service chưa chạy | Kiểm tra Docker, đợi 30 giây rồi thử |
| 401 / 403 | Token hết hạn hoặc sai quyền | Đăng xuất và đăng nhập lại |
| Upload file thất bại | File quá lớn hoặc sai định dạng | Dùng PDF/DOCX < 10MB |
| `/api/ai/health` trả 404 | Gateway chưa rebuild sau khi cập nhật config | `docker compose restart api-gateway` |
| `/internal-documents` lỗi 500 | document-service chưa rebuild sau khi thêm endpoint mới | `docker compose up -d --build document-service` |
| Cron ủy quyền không chạy | workflow-service chưa rebuild | `docker compose up -d --build workflow-service` |
| Chatbot không trả lời | Gemini API key chưa cấu hình hoặc hết hạn | Kiểm tra `GEMINI_API_KEY` trong `qlda-system/.env` |
| Danh sách rỗng | Chưa có dữ liệu seed hoặc filter quá hẹp | Xóa bộ lọc, tạo dữ liệu mới trước |
| Docker không start | Chưa chạy compose | `docker --context desktop-linux compose -f qlda-system/docker-compose.yml up -d` |

---

## Các Microservice Cần Rebuild Cho Tính Năng Mới

> Chỉ cần rebuild nếu chưa build lại từ sau khi code được cập nhật.

```bash
# Rebuild document-service (Văn bản nội bộ, PHAN_LOAI_VAN_BAN_NOI_BO)
docker compose up -d --build document-service

# Rebuild workflow-service (Cron job ủy quyền, @EnableScheduling)
docker compose up -d --build workflow-service

# Restart api-gateway (Route /api/ai/health mới)
docker compose restart api-gateway
```

Frontend hoạt động ngay (không cần rebuild) vì chỉ cần `npm run dev`.
