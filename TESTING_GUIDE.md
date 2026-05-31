# Hướng Dẫn Demo & Test Giao Diện — Hệ Thống QLDA

> **Mục tiêu:** Test toàn bộ chức năng qua giao diện người dùng (UI), không cần curl hay Postman.  
> **Thời gian ước tính:** 45–60 phút cho toàn bộ luồng.

---

## Tài Khoản Cần Dùng

Hệ thống dùng **đăng nhập Azure SSO** (tài khoản DUT). Cần **2 tài khoản** đăng nhập song song trên 2 trình duyệt khác nhau:

| # | Email đăng nhập | Vai trò trong hệ thống | Dùng để test |
|---|---|---|---|
| **TK1** | `102230222@sv1.dut.udn.vn` | Chuyên viên (USER) | Tạo văn bản, upload, tìm kiếm, ủy quyền |
| **TK2** | `102230238@sv1.dut.udn.vn` | Quản trị viên (ADMIN) | Phê duyệt, quản trị hệ thống, báo cáo |

> **Mật khẩu**: dùng mật khẩu DUT của từng tài khoản tương ứng.  
> **Cách mở 2 trình duyệt cùng lúc**: mở Chrome bình thường (TK2-Admin) + mở cửa sổ **Ẩn danh / Incognito** (TK1-User), hoặc dùng Chrome + Firefox.

---

## Điều Kiện Tiên Quyết

Trước khi bắt đầu, đảm bảo:

1. **Docker đang chạy** — mở Docker Desktop, kiểm tra tất cả container `qlda-*` đều **Running**
2. **Frontend đang chạy** — mở terminal, chạy `cd frontend && npm run dev`, truy cập `http://localhost:5173`
3. **Kiểm tra nhanh**: mở `http://localhost:8761` — phải thấy 5 service đã đăng ký (auth, document, workflow, ai, notification)

---

## Sơ Đồ Luồng Test

```
[TK1 - Chuyên viên]          [TK2 - Admin]
       │                            │
  Đăng nhập                    Đăng nhập
       │                            │
  Tạo văn bản đến ──────────> Xem & phê duyệt
       │                            │
  Tạo văn bản đi ───────────> Quản trị hệ thống
       │                            │
  Tìm kiếm / AI chatbot        Xem báo cáo
       │                            │
  Ủy quyền                    Audit log
```

---

## PHẦN 1 — ĐĂNG NHẬP

### Bước 1.1 — Đăng nhập TK2 (Admin) — Trình duyệt chính

1. Mở Chrome, vào `http://localhost:5173`
2. Trang hiển thị màn hình đăng nhập với nút **"Đăng nhập với Microsoft"**
3. Click nút đó
4. Trình duyệt chuyển sang trang Microsoft → đăng nhập bằng `102230238@sv1.dut.udn.vn`
5. Nếu lần đầu: bấm **Chấp nhận / Accept** ở màn hình xin quyền
6. ✅ **Kết quả**: chuyển vào trang Dashboard, sidebar hiển thị tên "Administrator"

### Bước 1.2 — Đăng nhập TK1 (Chuyên viên) — Incognito

1. Mở cửa sổ **Ẩn danh** (Ctrl+Shift+N), vào `http://localhost:5173`
2. Lặp lại quy trình như 1.1 nhưng dùng tài khoản `102230222@sv1.dut.udn.vn`
3. ✅ **Kết quả**: vào Dashboard, sidebar hiển thị tên "Phan Van Truong"

> Từ đây: **"Cửa sổ thường" = Admin (TK2)**, **"Cửa sổ ẩn danh" = Chuyên viên (TK1)**

---

## PHẦN 2 — DASHBOARD

### Bước 2.1 — Xem Dashboard (TK1 - Chuyên viên)

*Thực hiện tại: Cửa sổ ẩn danh*

1. Sau khi đăng nhập, đang ở trang `/dashboard`
2. Quan sát các thẻ thống kê: Văn bản đến, Văn bản đi, Chờ phê duyệt, Thông báo
3. ✅ **Kết quả**: các số liệu hiển thị (có thể là 0 nếu chưa có dữ liệu), không bị lỗi trang

### Bước 2.2 — Xem Dashboard Admin (TK2 - Admin)

*Thực hiện tại: Cửa sổ thường*

1. Ở sidebar, click **"Quản trị"** → **"Bảng điều khiển"** (hoặc vào `/admin/dashboard`)
2. ✅ **Kết quả**: trang Admin Dashboard với thống kê tổng quan hệ thống

---

## PHẦN 3 — VĂN BẢN ĐẾN

*Toàn bộ phần này thực hiện tại **Cửa sổ ẩn danh (TK1 - Chuyên viên)***

### Bước 3.1 — Xem danh sách văn bản đến

1. Click **"Văn bản đến"** ở sidebar → vào `/inbox`
2. ✅ **Kết quả**: trang tải được, hiển thị bảng danh sách văn bản (có thể có văn bản mẫu từ hệ thống)

### Bước 3.2 — Xem chi tiết một văn bản

1. Ở trang `/inbox`, click vào một dòng văn bản bất kỳ (nếu có)
2. ✅ **Kết quả**: trang chi tiết văn bản (`/documents/:id`) hiển thị đầy đủ thông tin: số ký hiệu, trích yếu, ngày tiếp nhận, trạng thái, file đính kèm

### Bước 3.3 — Chuyển xử lý văn bản

1. Quay lại `/inbox`
2. Ở dòng một văn bản, click nút **"Chuyển xử lý"** (hoặc chọn checkbox → action "Chuyển")
3. Form chuyển xử lý hiện ra: điền người nhận, đơn vị, nội dung, hạn xử lý
4. Click **"Xác nhận chuyển"**
5. ✅ **Kết quả**: thông báo thành công, trạng thái văn bản đổi thành "Đã chuyển xử lý"

---

## PHẦN 4 — UPLOAD VĂN BẢN

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 4.1 — Upload văn bản mới

1. Click **"Upload"** ở sidebar → vào `/upload`
2. Trang hiển thị vùng kéo thả file
3. Kéo thả một file **PDF hoặc DOCX** vào vùng upload (hoặc click để chọn file)
4. Điền các thông tin: Số ký hiệu (ví dụ: `VB-TEST-001`), Trích yếu, Loại văn bản, Đơn vị ban hành, Ngày văn bản
5. Click **"Upload"** hoặc **"Lưu"**
6. ✅ **Kết quả**: file upload thành công, hiển thị thông báo, văn bản xuất hiện ở danh sách `/inbox`

---

## PHẦN 5 — VĂN BẢN ĐI

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 5.1 — Xem danh sách văn bản đi

1. Click **"Văn bản đi"** ở sidebar → vào `/outgoing`
2. ✅ **Kết quả**: trang tải được, hiển thị bảng văn bản đi

### Bước 5.2 — Tạo văn bản đi mới

1. Click nút **"+ Tạo văn bản đi"** (hoặc tương tự)
2. Điền form:
   - Số ký hiệu: `CV-TEST-001`
   - Trích yếu: `Công văn test về phân bổ kinh phí`
   - Loại văn bản: chọn từ dropdown
   - Đơn vị chủ trì: chọn từ dropdown
   - Ngày văn bản: chọn ngày hôm nay
   - Độ khẩn: Bình thường
3. Click **"Lưu"**
4. ✅ **Kết quả**: văn bản được tạo, xuất hiện trong danh sách với trạng thái "Nháp"

### Bước 5.3 — Submit văn bản đi để phê duyệt

1. Ở dòng văn bản vừa tạo (CV-TEST-001), click **"Trình duyệt"** hoặc **"Submit phê duyệt"**
2. Chọn quy trình phê duyệt (nếu có dropdown)
3. Điền ghi chú: `Trình phê duyệt công văn test`
4. Click **"Xác nhận"**
5. ✅ **Kết quả**: trạng thái đổi sang "Chờ phê duyệt" hoặc "Trình ký"

> Sau bước này, chuyển sang cửa sổ thường (Admin) để thực hiện phê duyệt ở Phần 6.

---

## PHẦN 6 — PHÊ DUYỆT (APPROVALS)

### Bước 6.1 — Xem danh sách chờ phê duyệt (TK2 - Admin)

*Thực hiện tại **Cửa sổ thường (TK2)***

1. Click **"Phê duyệt"** ở sidebar → vào `/approvals`
2. ✅ **Kết quả**: danh sách các văn bản đang chờ phê duyệt hiển thị, trong đó có CV-TEST-001

### Bước 6.2 — Phê duyệt — Đồng ý

1. Ở dòng CV-TEST-001, click **"Phê duyệt"** (nút màu xanh ✅)
2. Modal hiện ra với tiêu đề "Phê duyệt văn bản"
3. Điền ghi chú: `Đồng ý phê duyệt, nội dung hợp lệ`
4. Click **"Xác nhận phê duyệt"**
5. ✅ **Kết quả**: trạng thái văn bản đổi sang "Đã duyệt", dòng đó biến khỏi danh sách chờ

### Bước 6.3 — Từ chối phê duyệt (test thêm)

1. Tạo một văn bản đi khác (lặp lại 5.2–5.3)
2. Ở màn Approvals, click **"Từ chối"** (nút đỏ 🚫)
3. Điền lý do: `Thiếu tài liệu kèm theo`
4. Click **"Xác nhận từ chối"**
5. ✅ **Kết quả**: trạng thái văn bản đổi sang "Từ chối"

### Bước 6.4 — Ghi chú / Yêu cầu bổ sung

1. Ở danh sách phê duyệt, click **"Ghi chú"** (nút 💬)
2. Điền: `Cần bổ sung thêm phụ lục kèm theo`
3. Click **"Gửi ghi chú"**
4. ✅ **Kết quả**: ghi chú được ghi lại, văn bản vẫn ở trạng thái chờ

---

## PHẦN 7 — HỒ SƠ (CASE FILES)

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 7.1 — Xem danh sách hồ sơ

1. Click **"Hồ sơ"** ở sidebar → vào `/case-files`
2. ✅ **Kết quả**: trang tải được, hiển thị danh sách hồ sơ

### Bước 7.2 — Tạo hồ sơ mới

1. Click **"+ Tạo hồ sơ"**
2. Điền: Mã hồ sơ `HS-TEST-2026`, Tên hồ sơ `Hồ sơ dự án thử nghiệm`, Năm lưu `2026`
3. Click **"Lưu"**
4. ✅ **Kết quả**: hồ sơ xuất hiện trong danh sách

---

## PHẦN 8 — TÌM KIẾM

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 8.1 — Tìm kiếm cơ bản

1. Click **"Tìm kiếm"** ở sidebar → vào `/search`
2. Gõ từ khóa `công văn` vào ô tìm kiếm, nhấn Enter hoặc click **"Tìm"**
3. ✅ **Kết quả**: danh sách kết quả hiển thị các văn bản khớp từ khóa

### Bước 8.2 — Tìm kiếm với bộ lọc

1. Ở trang tìm kiếm, sử dụng các bộ lọc:
   - Loại văn bản: chọn một loại
   - Trạng thái: chọn "Đang xử lý"
   - Khoảng thời gian: đặt từ đầu tháng đến nay
2. Click **"Tìm"**
3. ✅ **Kết quả**: kết quả thu hẹp theo bộ lọc

---

## PHẦN 9 — AI CHATBOT

*Thực hiện tại **bất kỳ trình duyệt nào** (TK1 hoặc TK2)*

### Bước 9.1 — Mở chatbot

1. Nhìn vào góc dưới phải màn hình → thấy icon **💬** chatbot nổi
2. Click vào đó để mở hộp chat
3. ✅ **Kết quả**: hộp chat mở ra, có ô nhập tin nhắn

### Bước 9.2 — Hỏi về quy trình

1. Gõ: `Hướng dẫn tạo công văn mới`
2. Nhấn Enter hoặc click gửi
3. ✅ **Kết quả**: AI trả lời bằng tiếng Việt, giải thích các bước

### Bước 9.3 — Hỏi về tìm kiếm văn bản

1. Gõ tiếp: `Làm thế nào để tìm văn bản theo ngày?`
2. ✅ **Kết quả**: AI trả lời hướng dẫn cụ thể

### Bước 9.4 — Test hỏi ngoài phạm vi

1. Gõ: `Thời tiết hôm nay thế nào?`
2. ✅ **Kết quả**: AI từ chối hoặc trả lời rằng chỉ hỗ trợ về quản lý văn bản

---

## PHẦN 10 — THÔNG BÁO

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 10.1 — Xem thông báo

1. Click **"Thông báo"** ở sidebar → vào `/notifications`  
   *hoặc* click icon chuông 🔔 ở topbar (nếu có)
2. ✅ **Kết quả**: danh sách thông báo hiển thị. Các thao tác vừa làm (phê duyệt, từ chối) có thể đã tạo thông báo

### Bước 10.2 — Đánh dấu đã đọc

1. Ở một thông báo chưa đọc, click vào nó hoặc click **"Đánh dấu đã đọc"**
2. ✅ **Kết quả**: thông báo không còn hiển thị trạng thái "Chưa đọc" (background thay đổi)

---

## PHẦN 11 — ỦY QUYỀN

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 11.1 — Tạo ủy quyền

1. Click **"Ủy quyền"** ở sidebar → vào `/delegation`
2. Click **"+ Tạo ủy quyền"**
3. Điền form:
   - Người được ủy quyền: chọn từ dropdown (ví dụ: Admin hoặc user khác)
   - Từ ngày: ngày mai
   - Đến ngày: một tuần sau
   - Phạm vi ủy quyền: `Ký duyệt công văn đến trong thời gian nghỉ phép`
4. Click **"Tạo ủy quyền"**
5. ✅ **Kết quả**: bảng ủy quyền cập nhật, hiển thị dòng mới với badge **"Hiệu lực"**

### Bước 11.2 — Hủy ủy quyền

1. Ở dòng ủy quyền vừa tạo, click **"Hủy"** hoặc **"Xóa"**
2. Xác nhận trong hộp thoại
3. ✅ **Kết quả**: trạng thái đổi sang "Đã hủy" hoặc dòng bị xóa khỏi danh sách

---

## PHẦN 12 — HỒ SƠ CÁ NHÂN

*Thực hiện tại **Cửa sổ ẩn danh (TK1)***

### Bước 12.1 — Xem hồ sơ cá nhân

1. Click vào **tên người dùng** ở sidebar hoặc click **"Hồ sơ cá nhân"** → vào `/profile`
2. ✅ **Kết quả**: hiển thị thông tin: họ tên, email, đơn vị, chức vụ, nhóm quyền

---

## PHẦN 13 — QUẢN TRỊ ADMIN

*Toàn bộ phần này thực hiện tại **Cửa sổ thường (TK2 - Admin)***

> Sidebar Admin có mục **"Quản trị"** với các submenu bên dưới.

### Bước 13.1 — Quản lý người dùng

1. Vào **Quản trị → Quản lý người dùng** (`/admin/users`)
2. ✅ **Kết quả**: danh sách tất cả user trong hệ thống hiển thị (ít nhất 2–4 user)

**Test tạo user:**
1. Click **"+ Thêm người dùng"**
2. Điền: Username `testuser01`, Họ tên `Người Dùng Test`, Email `testuser01@test.vn`, Đơn vị chọn từ dropdown, Nhóm quyền: USER
3. Click **"Lưu"**
4. ✅ **Kết quả**: user mới xuất hiện trong danh sách

**Test khóa user:**
1. Tìm user vừa tạo, click **"Khóa"** hoặc toggle trạng thái
2. ✅ **Kết quả**: badge trạng thái đổi sang "Không hoạt động"

### Bước 13.2 — Phân quyền

1. Vào **Quản trị → Phân quyền** (`/admin/permissions`)
2. ✅ **Kết quả**: danh sách các nhóm quyền (ADMIN, MANAGER, USER) với mô tả quyền hạn

**Test xem chi tiết nhóm quyền:**
1. Click vào nhóm "USER" để xem chi tiết quyền
2. ✅ **Kết quả**: danh sách quyền của nhóm hiển thị

### Bước 13.3 — Quản lý đơn vị

1. Vào **Quản trị → Quản lý đơn vị** (`/admin/units`)
2. ✅ **Kết quả**: danh sách phòng ban/đơn vị của cơ quan

**Test tạo đơn vị mới:**
1. Click **"+ Thêm đơn vị"**
2. Điền: Mã `DV-TEST`, Tên đơn vị `Phòng Test`, Email `test@coquan.vn`
3. Click **"Lưu"**
4. ✅ **Kết quả**: đơn vị mới xuất hiện trong danh sách

### Bước 13.4 — Quản lý loại văn bản

1. Vào **Quản trị → Loại văn bản** (`/admin/document-types`)
2. ✅ **Kết quả**: danh sách loại văn bản (Công văn, Biên bản, Đề xuất, v.v.)

**Test tạo loại văn bản:**
1. Click **"+ Thêm loại văn bản"**
2. Điền: Mã `LVB-TEST`, Tên `Loại văn bản test`, Mô tả `Dùng để test`
3. Click **"Lưu"**
4. ✅ **Kết quả**: loại mới xuất hiện trong danh sách

### Bước 13.5 — Quản lý quy trình

1. Vào **Quản trị → Quy trình xử lý** (`/admin/workflows`)
2. ✅ **Kết quả**: danh sách quy trình phê duyệt đang có trong hệ thống

**Test xem chi tiết quy trình:**
1. Click vào một quy trình để xem các bước
2. ✅ **Kết quả**: danh sách các bước quy trình (Bước 1: Chuyên viên → Bước 2: Trưởng phòng, v.v.)

**Test tạo quy trình mới:**
1. Click **"+ Thêm quy trình"**
2. Điền: Mã `QT-TEST`, Tên `Quy trình test đơn giản`, chọn loại văn bản
3. Click **"Lưu"**
4. Vào quy trình vừa tạo → click **"+ Thêm bước"**
5. Điền: Tên bước `Trưởng phòng duyệt`, Thứ tự 1, Thời gian xử lý 2 ngày
6. ✅ **Kết quả**: bước mới xuất hiện trong quy trình

### Bước 13.6 — Quản lý mẫu văn bản

1. Vào **Quản trị → Mẫu văn bản** (`/admin/templates`)
2. ✅ **Kết quả**: danh sách các mẫu soạn thảo có sẵn

**Test tạo mẫu mới:**
1. Click **"+ Thêm mẫu"**
2. Điền tên mẫu, chọn loại văn bản, nhập nội dung mẫu
3. Click **"Lưu"**
4. ✅ **Kết quả**: mẫu mới xuất hiện trong danh sách

### Bước 13.7 — Quản lý SLA

1. Vào **Quản trị → Quản lý SLA** (`/admin/sla`)
2. Chọn một quy trình từ dropdown **"Chọn quy trình"**
3. ✅ **Kết quả**: bảng SLA hiển thị thời gian xử lý của từng bước trong quy trình

**Test chỉnh sửa SLA:**
1. Ở một dòng bước quy trình, click **"Chỉnh sửa"**
2. Sửa thời gian xử lý (ví dụ: từ 2 → 3), đổi đơn vị sang "Ngày"
3. Click **"Lưu"**
4. ✅ **Kết quả**: giá trị cập nhật ngay trong bảng không cần reload trang

**Test xem vi phạm SLA:**
1. Click tab **"Vi phạm SLA"**
2. ✅ **Kết quả**: danh sách văn bản quá hạn xử lý (nếu có), hoặc thông báo "Không có vi phạm SLA ✅"

---

## PHẦN 14 — GIÁM SÁT HỆ THỐNG

*Thực hiện tại **Cửa sổ thường (TK2 - Admin)***

### Bước 14.1 — Xem trạng thái dịch vụ

1. Vào **Quản trị → Giám sát hệ thống** (`/admin/monitoring`)
2. ✅ **Kết quả**: trang hiển thị trạng thái Up/Down của các microservice (Auth, Document, Workflow, AI, Notification), tình trạng Kafka, Database

---

## PHẦN 15 — BÁO CÁO & THỐNG KÊ

*Thực hiện tại **Cửa sổ thường (TK2 - Admin)***

### Bước 15.1 — Xem tổng quan báo cáo

1. Vào **Quản trị → Thống kê & Báo cáo** (`/admin/reports`)
2. ✅ **Kết quả**: trang hiển thị các thẻ thống kê:
   - Tổng văn bản, Văn bản đến, Văn bản đi
   - Đã xử lý, Đang xử lý, Quá hạn
   - Tỉ lệ hoàn thành (%)
3. Biểu đồ "Số văn bản theo tháng" hiển thị (nếu có dữ liệu)
4. Bảng "Tiến độ xử lý quy trình" hiển thị số nhiệm vụ

### Bước 15.2 — Lọc theo khoảng thời gian

1. Chọn **Từ ngày** và **Đến ngày** ở bộ lọc phía trên
2. Click **"Lọc"**
3. ✅ **Kết quả**: các số liệu cập nhật theo khoảng thời gian đã chọn

### Bước 15.3 — Xuất báo cáo

1. Click **"Xuất CSV"** → file CSV tải về máy
2. Mở file, kiểm tra dữ liệu (Chỉ số, Giá trị)
3. Click **"Xuất Excel"** → file xlsx tải về (hoặc fallback sang CSV)
4. ✅ **Kết quả**: file tải về thành công

---

## PHẦN 16 — NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG)

*Thực hiện tại **Cửa sổ thường (TK2 - Admin)***

### Bước 16.1 — Xem nhật ký

1. Vào **Quản trị → Nhật ký hoạt động** (`/admin/audit-logs`)
2. ✅ **Kết quả**: danh sách các hành động trong hệ thống: đăng nhập, tạo văn bản, phê duyệt, v.v. kèm thời gian và người thực hiện

### Bước 16.2 — Lọc nhật ký

1. Sử dụng bộ lọc trên trang (theo người dùng, theo thời gian, theo loại hành động)
2. ✅ **Kết quả**: danh sách thu hẹp theo điều kiện lọc

---

## PHẦN 17 — ĐĂNG XUẤT

### Bước 17.1 — Đăng xuất TK1

*Tại cửa sổ ẩn danh (TK1)*

1. Click vào tên người dùng ở sidebar hoặc avatar góc trên
2. Click **"Đăng xuất"**
3. ✅ **Kết quả**: chuyển về trang `/login`, không thể truy cập `/dashboard` khi gõ tay vào URL

### Bước 17.2 — Đăng xuất TK2

*Tại cửa sổ thường (TK2)*

1. Lặp lại thao tác đăng xuất tương tự
2. ✅ **Kết quả**: về trang login

---

## Kịch Bản End-to-End Tổng Hợp

Kịch bản này chạy liên tục không ngắt, dùng để demo toàn bộ luồng nghiệp vụ:

```
BƯỚC 1 — Đăng nhập 2 tài khoản trên 2 cửa sổ
  → TK1 (ẩn danh): 102230222@sv1.dut.udn.vn
  → TK2 (thường):  102230238@sv1.dut.udn.vn

BƯỚC 2 — TK1 tạo văn bản đi
  → Vào /outgoing → "+ Tạo văn bản đi"
  → Điền thông tin → Lưu
  → Click "Trình duyệt" → chọn quy trình → Xác nhận

BƯỚC 3 — TK2 phê duyệt
  → Vào /approvals → thấy văn bản vừa trình
  → Click "Phê duyệt" → ghi chú → Xác nhận

BƯỚC 4 — TK1 kiểm tra thông báo
  → Vào /notifications
  → Thấy thông báo "Văn bản CV-TEST-001 đã được phê duyệt"

BƯỚC 5 — TK1 xem trạng thái văn bản
  → Vào /outgoing → thấy trạng thái "Đã duyệt"

BƯỚC 6 — TK1 tìm kiếm văn bản
  → Vào /search → gõ "TEST" → thấy kết quả

BƯỚC 7 — TK1 dùng AI chatbot hỏi quy trình
  → Click icon 💬 → hỏi "Làm thế nào để xem trạng thái văn bản?"

BƯỚC 8 — TK2 xem báo cáo
  → Vào /admin/reports → xem thống kê, xuất CSV

BƯỚC 9 — TK2 xem audit log
  → Vào /admin/audit-logs → thấy toàn bộ thao tác vừa làm

BƯỚC 10 — Đăng xuất cả 2 tài khoản
```

---

## Checklist Nhanh Trước Khi Nộp

### Hạ tầng
- [ ] Docker Desktop đang chạy, tất cả container `qlda-*` ở trạng thái Running
- [ ] `http://localhost:5173` mở được
- [ ] `http://localhost:8761` hiển thị các service đã đăng ký

### Đăng nhập
- [ ] TK1 đăng nhập Azure thành công, vào được Dashboard
- [ ] TK2 đăng nhập Azure thành công, vào được Dashboard
- [ ] Đăng xuất → redirect về `/login`

### Văn bản
- [ ] `/inbox` tải được, xem chi tiết văn bản được
- [ ] `/upload` upload file thành công
- [ ] `/outgoing` tạo văn bản đi thành công
- [ ] Submit văn bản đi để phê duyệt thành công

### Quy trình phê duyệt
- [ ] `/approvals` hiển thị danh sách chờ duyệt
- [ ] Phê duyệt đồng ý → trạng thái đổi thành "Đã duyệt"
- [ ] Từ chối → trạng thái đổi thành "Từ chối"

### Tính năng khác
- [ ] `/search` tìm kiếm văn bản được
- [ ] Chatbot 💬 trả lời được câu hỏi tiếng Việt
- [ ] `/notifications` hiển thị thông báo, đánh dấu đã đọc được
- [ ] `/delegation` tạo ủy quyền được

### Admin
- [ ] `/admin/users` xem + tạo + khóa user được
- [ ] `/admin/units` xem + tạo đơn vị được
- [ ] `/admin/document-types` xem + tạo loại văn bản được
- [ ] `/admin/workflows` xem + tạo quy trình + thêm bước được
- [ ] `/admin/templates` xem + tạo mẫu văn bản được
- [ ] `/admin/sla` chọn quy trình, sửa thời gian SLA được
- [ ] `/admin/monitoring` xem trạng thái dịch vụ được
- [ ] `/admin/reports` xem thống kê, xuất CSV được
- [ ] `/admin/audit-logs` xem nhật ký được

---

## Xử Lý Sự Cố Thường Gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
|---|---|---|
| Trang trắng sau đăng nhập | Token không hợp lệ | Xóa dữ liệu trình duyệt (F12 → Application → Clear site data) rồi đăng nhập lại |
| "Lỗi đăng nhập Azure" | Container auth-service chưa chạy | Kiểm tra Docker, đợi 30 giây sau khi start rồi thử lại |
| Trang báo 401 / 403 | Token hết hạn hoặc sai quyền | Đăng xuất và đăng nhập lại |
| Upload thất bại | File quá lớn hoặc sai định dạng | Dùng file PDF/DOCX nhỏ hơn 10MB |
| Chatbot không trả lời | API key Gemini chưa cấu hình | Kiểm tra `GEMINI_API_KEY` trong `qlda-system/.env` |
| Danh sách rỗng | Chưa có dữ liệu seed hoặc filter quá hẹp | Xóa bộ lọc, thử tạo dữ liệu mới trước |
| Docker không start | Chưa chạy `docker-compose up` | Chạy: `docker --context desktop-linux compose -f qlda-system/docker-compose.yml up -d` |
