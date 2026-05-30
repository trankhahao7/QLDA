2. Bạn cần test thủ công:

Start backend: docker --context desktop-linux compose -f qlda-system/docker-compose.yml up -d
Start frontend: cd frontend && npm run dev → mở http://localhost:5173
Đăng nhập với admin → kiểm tra:
Sidebar có hiện các menu mới (Văn bản đi, Phê duyệt, Hồ sơ, Thông báo)
/approvals — table văn bản chờ duyệt
/notifications — badge đỏ unread count
/outgoing — filter + nút tạo mới
/case-files — search + tạo hồ sơ
/admin/reports — stat cards + charts
/admin/sla — chọn workflow → sửa SLA

3. Việc bạn cần làm để test:

Feature	Cần làm
SSO	Đăng ký http://localhost:5173 SPA redirect URI trong Azure Portal → rebuild auth-service
Teams	Tạo Incoming Webhook trong Teams → thêm TEAMS_WEBHOOK_URL=https://... vào .env
Email	Thêm OUTLOOK_SMTP_USERNAME, OUTLOOK_SMTP_PASSWORD vào .env
SharePoint	Cần admin consent Sites.ReadWrite.All → thêm SHAREPOINT_ENABLED=true + site ID khi có
DB migration	Chạy migrations/V001__microsoft_token_columns.sql trên DB

4. Việc bạn cần làm:

Action	Command/Note
Chạy SQL migration	Execute migrations/V002__chu_ky_so.sql trên QLDA DB
Rebuild document-service	docker --context desktop-linux compose -f qlda-system/docker-compose.yml up --build -d document-service
Test ký số	Mở DocumentDetail → click "Ký số" → xác nhận → badge "Đã ký số" xuất hiện
Test Word Online	Chỉ available khi SHAREPOINT_ENABLED=true + document đã publish → edit link được tạo