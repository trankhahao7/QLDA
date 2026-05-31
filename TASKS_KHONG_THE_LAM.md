# Danh sách việc KHÔNG THỂ LÀM

> Cập nhật: 2026-05-31
> Mục đích: Tổng hợp những gì **không thể làm** (giới hạn môn học)
>
> **SharePoint:** Cần IT Admin Microsoft 365 của DUT grant quyền `Sites.ReadWrite.All` cho App Registration và cấp `SHAREPOINT_SITE_ID`. Nếu liên hệ được IT Admin DUT thì có thể làm; nếu không thì để trong danh sách "không thể làm".

---

## ❌ KHÔNG THỂ LÀM — Giới hạn môn học / thiếu hạ tầng thật

| # | Tính năng | Lý do không thể làm |
|---|---|---|
| 1 | **OCR engine thật** (Tesseract / Azure AI Vision) | Cần cài Tesseract local hoặc Azure AI Vision subscription. Không khả thi môn học. OCR hiện tại gọi AI service nhưng không extract text từ ảnh/PDF thật. |
| 2 | **Ký số điện tử pháp lý** (VNPT CA / Viettel CA) | Cần hợp đồng với CA provider (VNPT hoặc Viettel). `DigitalSignatureService` hiện chỉ dùng SHA-256 local — không có giá trị pháp lý. |
| 3 | **SharePoint lưu trữ tài liệu** | `SHAREPOINT_SITE_ID` trống trong `.env`. Cần IT Admin Microsoft 365 tenant cấp `Sites.ReadWrite.All` và lấy Site ID qua Graph Explorer. `SHAREPOINT_ENABLED=false`. |
| 4 | **OneDrive chỉnh sửa văn bản (Word Online)** | Phụ thuộc SharePoint. `getOneDriveEditUrl()` trả `null` khi SharePoint chưa enabled. Nút "Mở trong Word Online" sẽ không hiển thị. |
| 5 | **Kho lưu trữ hồ sơ dài hạn** | Phụ thuộc SharePoint document library. Không làm được khi SharePoint chưa enabled. |
| 6 | **MFA / Azure PIM** | Cần Azure AD Premium P2 — không phải tài khoản sinh viên. |
| 7 | **Kiểm thử tải (JMeter / k6)** — 100 concurrent users | Ngoài scope môn học. Cần môi trường staging riêng. |
| 8 | **OWASP ZAP Penetration Testing** | Ngoài scope môn học. Cần staging environment. |
| 9 | **HTTPS / TLS tại reverse proxy** | Cần production server, không áp dụng cho môi trường dev local. |
| 10 | **Redis rate limiting** (thay thế in-memory) | Cần thêm Redis vào Docker Compose. In-memory rate limiter hiện tại đủ dùng cho demo. |
| 11 | **Đào tạo người dùng** | Ngoài scope phần mềm — là hoạt động tổ chức. |
| 12 | **Lập kế hoạch và quản lý tiến độ dự án** | Ngoài scope phần mềm — là quy trình quản lý. |
