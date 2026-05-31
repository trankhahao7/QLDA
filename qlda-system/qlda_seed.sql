-- =============================================
-- QLDA Seed Data
-- TK1: icetruong (102230222@sv1.dut.udn.vn) — Chuyên viên (USER)
-- TK2: admin    (102230238@sv1.dut.udn.vn)  — Quản trị viên (ADMIN)
-- =============================================

-- Xóa dữ liệu cũ theo đúng thứ tự dependency
TRUNCATE TABLE ketquaai, lichsuhethong, thongbao, "UyQuyen",
               xulyvanban, hosocongviec, tepdinhkem, templatevanban,
               vanban, buocquytrinh, quytrinh, phanquyen,
               nguoidung, chucnang, nhomquyen, loaivanban, donvi
RESTART IDENTITY CASCADE;

-- =========================
-- 1. ĐƠN VỊ (5 phòng ban)
-- =========================
INSERT INTO donvi (id, madonvi, tendonvi, donvichaid, dienthoai, email, diachi, sudung) VALUES
(1, 'BGD',   'Ban Giám đốc',                    NULL, '0236-3820-100', 'bgd@qlda.edu.vn',        '41 Lê Duẩn, Đà Nẵng', TRUE),
(2, 'PKTC',  'Phòng Kế hoạch & Tài chính',      1,    '0236-3820-101', 'pktc@qlda.edu.vn',       '41 Lê Duẩn, Đà Nẵng', TRUE),
(3, 'PCNTT', 'Phòng Công nghệ Thông tin',        1,    '0236-3820-102', 'cntt@qlda.edu.vn',       '41 Lê Duẩn, Đà Nẵng', TRUE),
(4, 'PHC',   'Phòng Hành chính - Tổng hợp',     1,    '0236-3820-103', 'hanhchinh@qlda.edu.vn',  '41 Lê Duẩn, Đà Nẵng', TRUE),
(5, 'BQLDA', 'Ban Quản lý Dự án',                1,    '0236-3820-104', 'qlda@qlda.edu.vn',       '41 Lê Duẩn, Đà Nẵng', TRUE);

-- =========================
-- 2. NHÓM QUYỀN
-- =========================
INSERT INTO nhomquyen (id, manhomquyen, tennhomquyen, mota, sudung) VALUES
(1, 'ADMIN',   'Quản trị hệ thống', 'Toàn quyền quản trị và cấu hình hệ thống', TRUE),
(2, 'MANAGER', 'Trưởng đơn vị',     'Quản lý đơn vị, phê duyệt văn bản',        TRUE),
(3, 'USER',    'Chuyên viên',        'Xử lý văn bản thông thường',               TRUE);

-- =========================
-- 3. CHỨC NĂNG
-- =========================
INSERT INTO chucnang (id, machucnang, tenchucnang, mota, thutu, sudung) VALUES
(1,  'VIEW_DASHBOARD',     'Xem Dashboard',          'Xem trang tổng quan',                   1,  TRUE),
(2,  'MANAGE_USERS',       'Quản lý người dùng',     'Thêm/sửa/xóa người dùng',               2,  TRUE),
(3,  'MANAGE_DOCUMENTS',   'Quản lý văn bản',        'Tạo/chỉnh sửa/xóa văn bản',             3,  TRUE),
(4,  'APPROVE_DOCUMENT',   'Phê duyệt văn bản',      'Phê duyệt/từ chối văn bản',             4,  TRUE),
(5,  'MANAGE_UNITS',       'Quản lý đơn vị',         'Thêm/sửa/xóa đơn vị tổ chức',          5,  TRUE),
(6,  'MANAGE_WORKFLOWS',   'Quản lý quy trình',      'Cấu hình quy trình xử lý văn bản',      6,  TRUE),
(7,  'MANAGE_TEMPLATES',   'Quản lý mẫu văn bản',    'Tạo/chỉnh sửa mẫu soạn thảo',          7,  TRUE),
(8,  'VIEW_REPORTS',       'Xem báo cáo',            'Xem thống kê và báo cáo hệ thống',      8,  TRUE),
(9,  'VIEW_AUDIT_LOGS',    'Xem nhật ký',            'Xem lịch sử hoạt động hệ thống',        9,  TRUE),
(10, 'MANAGE_PERMISSIONS', 'Phân quyền',             'Cấu hình quyền truy cập theo nhóm',     10, TRUE),
(11, 'UPLOAD_DOCUMENTS',   'Upload văn bản',         'Tải văn bản lên hệ thống',              11, TRUE),
(12, 'TRANSFER_DOCUMENTS', 'Chuyển xử lý',           'Chuyển văn bản cho người khác xử lý',   12, TRUE),
(13, 'MANAGE_CASE_FILES',  'Quản lý hồ sơ',          'Tạo/chỉnh sửa hồ sơ công việc',         13, TRUE),
(14, 'DELEGATION',         'Ủy quyền',               'Ủy quyền xử lý cho người khác',         14, TRUE),
(15, 'USE_AI',             'Sử dụng AI',             'Dùng tính năng AI hỗ trợ xử lý',        15, TRUE);

-- =========================
-- 4. PHÂN QUYỀN
-- =========================
INSERT INTO phanquyen (id, nhomquyenid, chucnangid, isview, iscreate, isedit, isdelete, isapprove) VALUES
-- ADMIN: toàn quyền
(1,  1, 1,  TRUE, TRUE, TRUE, TRUE, TRUE),
(2,  1, 2,  TRUE, TRUE, TRUE, TRUE, TRUE),
(3,  1, 3,  TRUE, TRUE, TRUE, TRUE, TRUE),
(4,  1, 4,  TRUE, TRUE, TRUE, TRUE, TRUE),
(5,  1, 5,  TRUE, TRUE, TRUE, TRUE, TRUE),
(6,  1, 6,  TRUE, TRUE, TRUE, TRUE, TRUE),
(7,  1, 7,  TRUE, TRUE, TRUE, TRUE, TRUE),
(8,  1, 8,  TRUE, TRUE, TRUE, TRUE, TRUE),
(9,  1, 9,  TRUE, TRUE, TRUE, TRUE, TRUE),
(10, 1, 10, TRUE, TRUE, TRUE, TRUE, TRUE),
(11, 1, 11, TRUE, TRUE, TRUE, TRUE, TRUE),
(12, 1, 12, TRUE, TRUE, TRUE, TRUE, TRUE),
(13, 1, 13, TRUE, TRUE, TRUE, TRUE, TRUE),
(14, 1, 14, TRUE, TRUE, TRUE, TRUE, TRUE),
(15, 1, 15, TRUE, TRUE, TRUE, TRUE, TRUE),
-- MANAGER: phê duyệt, xem báo cáo, xử lý văn bản
(16, 2, 1,  TRUE, FALSE, FALSE, FALSE, FALSE),
(17, 2, 3,  TRUE, TRUE,  TRUE,  FALSE, FALSE),
(18, 2, 4,  TRUE, FALSE, FALSE, FALSE, TRUE),
(19, 2, 8,  TRUE, FALSE, FALSE, FALSE, FALSE),
(20, 2, 11, TRUE, TRUE,  FALSE, FALSE, FALSE),
(21, 2, 12, TRUE, TRUE,  FALSE, FALSE, FALSE),
(22, 2, 13, TRUE, TRUE,  TRUE,  FALSE, FALSE),
(23, 2, 14, TRUE, TRUE,  FALSE, FALSE, FALSE),
(24, 2, 15, TRUE, FALSE, FALSE, FALSE, FALSE),
-- USER: xem, tạo, upload, chuyển xử lý
(25, 3, 1,  TRUE, FALSE, FALSE, FALSE, FALSE),
(26, 3, 3,  TRUE, TRUE,  TRUE,  FALSE, FALSE),
(27, 3, 11, TRUE, TRUE,  FALSE, FALSE, FALSE),
(28, 3, 12, TRUE, TRUE,  FALSE, FALSE, FALSE),
(29, 3, 13, TRUE, TRUE,  TRUE,  FALSE, FALSE),
(30, 3, 14, TRUE, TRUE,  FALSE, FALSE, FALSE),
(31, 3, 15, TRUE, FALSE, FALSE, FALSE, FALSE);

-- =========================
-- 5. NGƯỜI DÙNG (2 tài khoản Azure DUT)
-- =========================
INSERT INTO nguoidung (id, username, hoten, email, dienthoai, donviid, chucvu, nhomquyenid, azuread_id, trangthai) VALUES
(1001, 'admin',     'Quản Trị Viên',   '102230238@sv1.dut.udn.vn', '0905111001', 1, 'Quản trị viên hệ thống', 1, NULL, 1),
(1002, 'icetruong', 'Phan Văn Trường', '102230222@sv1.dut.udn.vn', '0905111002', 3, 'Chuyên viên CNTT',       3, NULL, 1);

-- =========================
-- 6. LOẠI VĂN BẢN (5 loại)
-- =========================
INSERT INTO loaivanban (id, maloaivanban, tenloaivanban, mota, sudung) VALUES
(1, 'CONG_VAN',   'Công văn',          'Công văn hành chính đi/đến',         TRUE),
(2, 'BIEN_BAN',   'Biên bản',          'Biên bản họp, nghiệm thu, bàn giao', TRUE),
(3, 'DE_XUAT',    'Đề xuất',           'Văn bản đề xuất, kiến nghị',         TRUE),
(4, 'QUYET_DINH', 'Quyết định',        'Quyết định, nghị quyết',             TRUE),
(5, 'THONG_BAO',  'Thông báo nội bộ',  'Thông báo, thông tri nội bộ',        TRUE);

-- =========================
-- 7. TEMPLATE VĂN BẢN (6 mẫu)
-- =========================
INSERT INTO templatevanban (id, matemplate, tentemplate, loaivanbanid, noidungmau, tepmau, nguoitaoid, sudung) VALUES
(1, 'TPL-CV-01', 'Mẫu công văn hành chính',       1, E'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n---\nSố: .../.../CV-...\n\nKính gửi: ...\n\nCăn cứ: ...\n\nNội dung:\n...\n\nNơi nhận:\n- Như trên;\n- Lưu VP.', NULL, 1001, TRUE),
(2, 'TPL-CV-02', 'Mẫu công văn trả lời',           1, E'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n---\nSố: .../.../CV-...\nV/v: Trả lời công văn số ...\n\nKính gửi: ...\n\nTrả lời công văn số ... ngày ... của ..., chúng tôi có ý kiến như sau:\n...',  NULL, 1001, TRUE),
(3, 'TPL-BB-01', 'Mẫu biên bản họp',               2, E'BIÊN BẢN HỌP\nNgày ... tháng ... năm ...\nĐịa điểm: ...\nThành phần tham dự:\n- ...\nChủ trì: ...\n\nNội dung thảo luận:\n...\n\nKết luận:\n...\n\nThư ký\t\t\tChủ trì', NULL, 1001, TRUE),
(4, 'TPL-BB-02', 'Mẫu biên bản nghiệm thu',        2, E'BIÊN BẢN NGHIỆM THU\nHạng mục: ...\nĐơn vị thực hiện: ...\nĐơn vị nghiệm thu: ...\n\nNội dung nghiệm thu:\n...\n\nKết quả: ĐẠT / KHÔNG ĐẠT\nKiến nghị: ...', NULL, 1001, TRUE),
(5, 'TPL-DX-01', 'Mẫu đề xuất mua sắm thiết bị',  3, E'ĐỀ XUẤT\nV/v: Mua sắm thiết bị ...\n\nCăn cứ nhu cầu thực tế, đề xuất mua:\n1. Tên thiết bị: ...\n2. Số lượng: ...\n3. Đơn giá dự kiến: ...\n4. Tổng kinh phí: ...\n5. Nguồn kinh phí: ...', NULL, 1002, TRUE),
(6, 'TPL-QD-01', 'Mẫu quyết định nội bộ',         4, E'QUYẾT ĐỊNH\nV/v: ...\n\nGIÁM ĐỐC\n\nCăn cứ Điều lệ tổ chức và hoạt động;\nCăn cứ đề nghị của ...;\n\nQUYẾT ĐỊNH:\nĐiều 1: ...\nĐiều 2: ...\nĐiều 3: Quyết định này có hiệu lực kể từ ngày ký.', NULL, 1001, TRUE);

-- =========================
-- 8. QUY TRÌNH XỬ LÝ (3 quy trình)
-- =========================
INSERT INTO quytrinh (id, maquytrinh, tenquytrinh, loaivanbanid, mota, sobuoc, sudung) VALUES
(1, 'QT-CV-THUONG', 'Quy trình công văn thông thường', 1, 'Luồng 3 bước: Chuyên viên → Trưởng phòng → Ban Giám đốc', 3, TRUE),
(2, 'QT-NHANH',     'Quy trình phê duyệt nhanh',       1, 'Luồng 2 bước: Chuyên viên chuẩn bị → Admin phê duyệt',    2, TRUE),
(3, 'QT-NGHIEM-THU','Quy trình nghiệm thu dự án',      2, 'Luồng 4 bước đầy đủ cho biên bản nghiệm thu hạng mục',    4, TRUE);

-- =========================
-- 9. BƯỚC QUY TRÌNH
-- =========================
INSERT INTO buocquytrinh (id, quytrinhid, tenbuoc, thutubuoc, vaitroxuly, thoigianxuly, batbuocpheduyet) VALUES
-- QT-CV-THUONG (3 bước) — thoigianxuly tính bằng giờ
(10001, 1, 'Chuyên viên tiếp nhận và xử lý',    1, 'CHUYEN_VIEN',  48, FALSE),
(10002, 1, 'Trưởng phòng xem xét và ký nháy',   2, 'TRUONG_PHONG', 24, TRUE),
(10003, 1, 'Ban Giám đốc phê duyệt cuối',        3, 'GIAM_DOC',     48, TRUE),
-- QT-NHANH (2 bước)
(10004, 2, 'Chuyên viên soạn thảo hồ sơ',       1, 'CHUYEN_VIEN',  24, FALSE),
(10005, 2, 'Quản trị viên phê duyệt',            2, 'ADMIN',        24, TRUE),
-- QT-NGHIEM-THU (4 bước)
(10006, 3, 'Lập biên bản thực địa',              1, 'CHUYEN_VIEN',  24, FALSE),
(10007, 3, 'Thẩm định kỹ thuật',                 2, 'CHUYEN_VIEN',  48, TRUE),
(10008, 3, 'Trưởng phòng ký xác nhận',           3, 'TRUONG_PHONG', 24, TRUE),
(10009, 3, 'Ban Giám đốc phê duyệt cuối',        4, 'GIAM_DOC',     48, TRUE);

-- =========================
-- 10. VĂN BẢN
-- phanloaivanban: 0=đến, 1=đi
-- trangthai: 0=Nháp, 1=Đang xử lý, 2=Đã chuyển xử lý, 3=Trình ký, 4=Đã ký, 5=Đã phát hành
-- dokhan: BINH_THUONG, KHAN, THUONG_KHAN, HOA_TOC
-- =========================

-- ---- VĂN BẢN ĐẾN (10 văn bản) ----
INSERT INTO vanban (id, sokyhieu, trichyeu, loaivanbanid, phanloaivanban, donvibanhanh, nguoiky, ngayvanban, ngaytiepnhan, domat, dokhan, nguoitaoid, donvichutriid, hanxuly, trangthai, daocr, dakyso, ngayphathanh, daxoa) VALUES
(5001, 'CV/2026/BTC-001',
  'Công văn về việc phân bổ kinh phí hoạt động quý II năm 2026',
  1, 0, 'Bộ Tài chính', 'Bộ trưởng Nguyễn Văn A',
  NOW()-INTERVAL '20 days', NOW()-INTERVAL '19 days',
  'Bình thường', 'BINH_THUONG', 1002, 2,
  NOW()+INTERVAL '5 days', 1, FALSE, FALSE, NULL, FALSE),

(5002, 'CV/2026/BKHDT-002',
  'Công văn hướng dẫn lập kế hoạch đầu tư công trung hạn giai đoạn 2026-2030',
  1, 0, 'Bộ KH&ĐT', 'Thứ trưởng Lê Văn B',
  NOW()-INTERVAL '15 days', NOW()-INTERVAL '14 days',
  'Bình thường', 'BINH_THUONG', 1002, 2,
  NOW()+INTERVAL '10 days', 2, FALSE, FALSE, NULL, FALSE),

(5003, 'BB/2026/NT-003',
  'Biên bản nghiệm thu hạng mục hạ tầng mạng nội bộ giai đoạn 1',
  2, 0, 'Công ty CP Giải pháp CNTT', 'Giám đốc Trần Văn C',
  NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days',
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()+INTERVAL '3 days', 1, FALSE, FALSE, NULL, FALSE),

(5004, 'DX/2026/PHC-004',
  'Đề xuất mua sắm máy tính xách tay phục vụ công tác chuyên môn năm 2026',
  3, 0, 'Phòng Hành chính - Tổng hợp', 'Trưởng phòng Nguyễn Thị D',
  NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days',
  'Bình thường', 'BINH_THUONG', 1002, 4,
  NOW()+INTERVAL '7 days', 3, FALSE, FALSE, NULL, FALSE),

(5005, 'CV/2026/BGDDT-005',
  'Công văn về việc tổ chức hội nghị tổng kết năm học 2025-2026',
  1, 0, 'Bộ Giáo dục & Đào tạo', 'Bộ trưởng Nguyễn Văn E',
  NOW()-INTERVAL '30 days', NOW()-INTERVAL '29 days',
  'Bình thường', 'BINH_THUONG', 1002, 1,
  NOW()-INTERVAL '10 days', 4, TRUE, FALSE, NOW()-INTERVAL '25 days', FALSE),

(5006, 'CV/2026/SOKHDT-006',
  'Công văn khẩn về việc báo cáo tiến độ dự án đầu tư xây dựng trọng điểm',
  1, 0, 'Sở KH&ĐT Đà Nẵng', 'Phó Giám đốc Lê Thị F',
  NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days',
  'Bình thường', 'KHAN', 1002, 5,
  NOW()+INTERVAL '2 days', 1, FALSE, FALSE, NULL, FALSE),

(5007, 'QD/2026/BGD-007',
  'Quyết định về việc thành lập Ban Kiểm soát nội bộ năm 2026',
  4, 0, 'Ban Giám đốc', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '45 days', NOW()-INTERVAL '44 days',
  'Bình thường', 'BINH_THUONG', 1001, 1,
  NOW()-INTERVAL '30 days', 5, FALSE, TRUE, NOW()-INTERVAL '40 days', FALSE),

(5008, 'BB/2026/HN-008',
  'Biên bản họp Ban Giám đốc tháng 5 năm 2026 về kế hoạch phát triển dài hạn',
  2, 0, 'Ban Giám đốc', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days',
  'Bình thường', 'BINH_THUONG', 1001, 1,
  NOW()-INTERVAL '1 day', 1, FALSE, FALSE, NULL, FALSE),

(5009, 'CV/2026/UBND-009',
  'Công văn xin ý kiến về quy hoạch sử dụng đất khu công nghệ cao Đà Nẵng',
  1, 0, 'UBND TP. Đà Nẵng', 'Phó Chủ tịch Trần Văn H',
  NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days',
  'Bình thường', 'BINH_THUONG', 1002, 2,
  NOW()+INTERVAL '4 days', 2, FALSE, FALSE, NULL, FALSE),

(5010, 'CV/2026/CATTT-010',
  'Công văn thượng khẩn về sự cố an toàn thông tin hệ thống nội bộ cần xử lý ngay',
  1, 0, 'Cục An toàn thông tin - Bộ TT&TT', 'Cục trưởng Vũ Văn I',
  NOW()-INTERVAL '1 day', NOW(),
  'Bình thường', 'THUONG_KHAN', 1002, 3,
  NOW()+INTERVAL '1 day', 1, FALSE, FALSE, NULL, FALSE),

-- ---- VĂN BẢN ĐI (8 văn bản) ----
(5011, 'CV/2026/PCNTT-011',
  'Báo cáo tình hình triển khai hệ thống quản lý văn bản điện tử tại đơn vị',
  1, 1, 'Phòng Công nghệ Thông tin', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '25 days', NULL,
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()-INTERVAL '10 days', 5, FALSE, TRUE, NOW()-INTERVAL '20 days', FALSE),

(5012, 'CV/2026/PCNTT-012',
  'Đề xuất nâng cấp hạ tầng máy chủ và hệ thống lưu trữ dữ liệu năm 2026',
  1, 1, 'Phòng Công nghệ Thông tin', 'Trưởng phòng Phan Văn Trường',
  NOW()-INTERVAL '12 days', NULL,
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()+INTERVAL '5 days', 1, FALSE, FALSE, NULL, FALSE),

(5013, 'BC/2026/PCNTT-013',
  'Báo cáo tổng kết hoạt động và kết quả thực hiện nhiệm vụ quý I năm 2026',
  1, 1, 'Phòng Công nghệ Thông tin', 'Trưởng phòng Phan Văn Trường',
  NOW()-INTERVAL '6 days', NULL,
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()+INTERVAL '2 days', 3, FALSE, FALSE, NULL, FALSE),

(5014, 'QD/2026/BGD-014',
  'Quyết định khen thưởng cá nhân và tập thể xuất sắc năm học 2024-2025',
  4, 1, 'Ban Giám đốc', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '35 days', NULL,
  'Bình thường', 'BINH_THUONG', 1001, 1,
  NOW()-INTERVAL '15 days', 4, FALSE, TRUE, NOW()-INTERVAL '30 days', FALSE),

(5015, 'CV/2026/BGD-015',
  'Công văn trả lời về việc phối hợp tổ chức hội thảo khoa học quốc tế năm 2026',
  1, 1, 'Ban Giám đốc', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '18 days', NULL,
  'Bình thường', 'BINH_THUONG', 1001, 1,
  NOW()-INTERVAL '5 days', 5, FALSE, TRUE, NOW()-INTERVAL '15 days', FALSE),

(5016, 'CV/2026/PCNTT-016',
  '[Nháp] Đề xuất kế hoạch và ngân sách hoạt động CNTT năm 2027',
  1, 1, 'Phòng Công nghệ Thông tin', 'Trưởng phòng Phan Văn Trường',
  NOW(), NULL,
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()+INTERVAL '30 days', 0, FALSE, FALSE, NULL, FALSE),

(5017, 'CV/2026/PCNTT-017',
  'Công văn phản hồi kết quả kiểm tra và đánh giá hệ thống bảo mật thông tin',
  1, 1, 'Phòng Công nghệ Thông tin', 'Giám đốc Phan Văn G',
  NOW()-INTERVAL '4 days', NULL,
  'Bình thường', 'KHAN', 1002, 3,
  NOW()+INTERVAL '1 day', 3, FALSE, FALSE, NULL, FALSE),

(5018, 'BB/2026/PCNTT-018',
  'Biên bản họp triển khai hệ thống quản lý văn bản điện tử tháng 5/2026',
  2, 1, 'Phòng Công nghệ Thông tin', 'Trưởng phòng Phan Văn Trường',
  NOW()-INTERVAL '9 days', NULL,
  'Bình thường', 'BINH_THUONG', 1002, 3,
  NOW()-INTERVAL '2 days', 2, FALSE, FALSE, NULL, FALSE);

-- =========================
-- 11. FILE ĐÍNH KÈM
-- =========================
INSERT INTO tepdinhkem (id, vanbanid, tentep, duongdantep, loaitep, kichthuoc, nguoitailenid) VALUES
(20001, 5001, 'phan_bo_kinh_phi_q2_2026.pdf',       '/files/5001/phan_bo_kinh_phi_q2_2026.pdf',       'PDF',  245760, 1002),
(20002, 5002, 'huong_dan_lap_ke_hoach_2026_2030.pdf','/files/5002/huong_dan_lap_ke_hoach.pdf',          'PDF',  512000, 1002),
(20003, 5002, 'phu_luc_ke_hoach_trung_han.xlsx',     '/files/5002/phu_luc_ke_hoach.xlsx',              'XLSX', 98304,  1002),
(20004, 5003, 'bien_ban_nghiem_thu_ha_tang.pdf',     '/files/5003/bien_ban_nghiem_thu_ha_tang.pdf',    'PDF',  384000, 1002),
(20005, 5003, 'bien_ban_ky_thuat.docx',              '/files/5003/bien_ban_ky_thuat.docx',             'DOCX', 102400, 1002),
(20006, 5004, 'de_xuat_mua_may_tinh_2026.pdf',      '/files/5004/de_xuat_mua_may_tinh.pdf',           'PDF',  163840, 1002),
(20007, 5004, 'bao_gia_thiet_bi.xlsx',               '/files/5004/bao_gia_thiet_bi.xlsx',              'XLSX', 45056,  1002),
(20008, 5005, 'thong_bao_hoi_nghi_tong_ket.pdf',    '/files/5005/thong_bao_hoi_nghi.pdf',             'PDF',  81920,  1002),
(20009, 5006, 'bao_cao_tien_do_du_an.pdf',           '/files/5006/bao_cao_tien_do.pdf',                'PDF',  204800, 1002),
(20010, 5007, 'quyet_dinh_ban_ksn.pdf',              '/files/5007/quyet_dinh_ban_ksn.pdf',             'PDF',  122880, 1001),
(20011, 5008, 'bien_ban_hop_bgd_t5_2026.pdf',       '/files/5008/bien_ban_hop_bgd.pdf',               'PDF',  286720, 1001),
(20012, 5009, 'cv_quy_hoach_khu_cn.pdf',             '/files/5009/cv_quy_hoach.pdf',                   'PDF',  163840, 1002),
(20013, 5010, 'cv_su_co_attt_khan.pdf',              '/files/5010/cv_su_co_attt.pdf',                  'PDF',  92160,  1002),
(20014, 5011, 'bao_cao_qlvb_dien_tu.pdf',            '/files/5011/bao_cao_qlvb.pdf',                   'PDF',  327680, 1002),
(20015, 5012, 'de_xuat_nang_cap_ha_tang.pdf',        '/files/5012/de_xuat_nang_cap.pdf',               'PDF',  245760, 1002),
(20016, 5012, 'du_toan_nang_cap.xlsx',               '/files/5012/du_toan_nang_cap.xlsx',              'XLSX', 73728,  1002),
(20017, 5013, 'bao_cao_tong_ket_q1_2026.pdf',        '/files/5013/bao_cao_q1.pdf',                     'PDF',  409600, 1002),
(20018, 5013, 'so_lieu_thong_ke_q1.xlsx',            '/files/5013/so_lieu_q1.xlsx',                    'XLSX', 131072, 1002),
(20019, 5014, 'quyet_dinh_khen_thuong_2025.pdf',     '/files/5014/quyet_dinh_khen_thuong.pdf',         'PDF',  184320, 1001),
(20020, 5014, 'danh_sach_khen_thuong.xlsx',          '/files/5014/danh_sach_khen_thuong.xlsx',         'XLSX', 65536,  1001),
(20021, 5015, 'cv_phoi_hop_hoi_thao.pdf',            '/files/5015/cv_phoi_hop.pdf',                    'PDF',  122880, 1001),
(20022, 5017, 'cv_phan_hoi_bao_mat.pdf',             '/files/5017/cv_phan_hoi_bao_mat.pdf',            'PDF',  163840, 1002),
(20023, 5018, 'bien_ban_hop_qlvb_t5.pdf',            '/files/5018/bien_ban_hop.pdf',                   'PDF',  204800, 1002);

-- =========================
-- 12. HỒ SƠ CÔNG VIỆC
-- =========================
INSERT INTO hosocongviec (id, mahoso, tenhoso, vanbanid, nguoiphutrachid, donviid, trangthai, ngaymohoso) VALUES
(30001, 'HS-2026-001', 'Hồ sơ dự án nâng cấp hạ tầng CNTT năm 2026',           5001, 1002, 3, 1, NOW()-INTERVAL '19 days'),
(30002, 'HS-2026-002', 'Hồ sơ nghiệm thu hạng mục hạ tầng mạng giai đoạn 1',   5003, 1002, 3, 1, NOW()-INTERVAL '9 days'),
(30003, 'HS-2026-003', 'Hồ sơ khen thưởng cá nhân và tập thể xuất sắc 2025',   5014, 1001, 1, 2, NOW()-INTERVAL '35 days'),
(30004, 'HS-2026-004', 'Hồ sơ phối hợp tổ chức hội thảo khoa học quốc tế 2026',5015, 1001, 1, 1, NOW()-INTERVAL '18 days'),
(30005, 'HS-2026-005', 'Hồ sơ xử lý sự cố an toàn thông tin tháng 5/2026',     5010, 1002, 3, 1, NOW());

-- =========================
-- 13. XỬ LÝ VĂN BẢN
-- trangthaixuly: 0=Chờ xử lý, 1=Đang xử lý, 2=Đã duyệt, 3=Từ chối
-- Các bản có trangthaixuly=0 và nguoinhanid=1001 sẽ hiện trong màn Approvals của Admin
-- =========================
INSERT INTO xulyvanban (id, vanbanid, buocquytrinhid, nguoiguiid, nguoinhanid, donvixulyid, hanhdongxuly, ykienxuly, ngaynhan, hanxuly, trangthaixuly) VALUES
-- VB 5001: bước 1 chờ admin xử lý
(40001, 5001, 10001, 1002, 1001, 2,
 'PHAN_CONG', 'Kính chuyển để xem xét, có ý kiến chỉ đạo',
 NOW()-INTERVAL '18 days', NOW()+INTERVAL '5 days', 0),

-- VB 5002: bước 1 đã xong, bước 2 đã xong
(40002, 5002, 10001, 1002, 1001, 2,
 'PHAN_CONG', 'Kính chuyển để nghiên cứu và thực hiện',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '5 days', 2),
(40003, 5002, 10002, 1001, 1002, 2,
 'PHE_DUYET', 'Đã xem xét, yêu cầu chuyên viên phòng CNTT thực hiện theo hướng dẫn',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '3 days', 2),

-- VB 5003: bước 1 đang xử lý
(40004, 5003, 10006, 1002, 1002, 3,
 'PHAN_CONG', 'Tiếp nhận và tiến hành lập biên bản thực địa',
 NOW()-INTERVAL '8 days', NOW()+INTERVAL '3 days', 1),

-- VB 5004: bước 1 xong, bước 2 chờ admin duyệt (màn Approvals sẽ hiện)
(40005, 5004, 10004, 1002, 1002, 4,
 'SOAN_THAO', 'Đã chuẩn bị hồ sơ đề xuất mua sắm đầy đủ',
 NOW()-INTERVAL '5 days', NOW()-INTERVAL '1 day', 2),
(40006, 5004, 10005, 1002, 1001, 4,
 'TRINH_DUYET', 'Kính trình Ban Giám đốc phê duyệt đề xuất mua máy tính',
 NOW()-INTERVAL '1 day', NOW()+INTERVAL '7 days', 0),

-- VB 5005: đã hoàn tất toàn bộ 2 bước
(40007, 5005, 10001, 1002, 1001, 1,
 'PHAN_CONG', 'Kính chuyển để có chỉ đạo tổ chức hội nghị',
 NOW()-INTERVAL '28 days', NOW()-INTERVAL '20 days', 2),
(40008, 5005, 10002, 1001, 1001, 1,
 'PHE_DUYET', 'Đồng ý. Giao Phòng HC tổ chức hội nghị theo kế hoạch',
 NOW()-INTERVAL '25 days', NOW()-INTERVAL '15 days', 2),

-- VB 5006: khẩn, chờ admin chỉ đạo
(40009, 5006, 10001, 1002, 1001, 5,
 'PHAN_CONG', 'KHẨN - Kính chuyển để có chỉ đạo xử lý ngay',
 NOW()-INTERVAL '1 day', NOW()+INTERVAL '2 days', 0),

-- VB 5008: quá hạn chưa xử lý (để test SLA violations)
(40010, 5008, 10001, 1001, 1001, 1,
 'PHAN_CONG', 'Biên bản họp BGD tháng 5 cần xử lý lưu hồ sơ',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '1 day', 0),

-- VB 5009: đã chuyển xử lý
(40011, 5009, 10001, 1002, 1001, 2,
 'PHAN_CONG', 'Kính chuyển để nghiên cứu, có ý kiến trả lời UBND',
 NOW()-INTERVAL '10 days', NOW()+INTERVAL '4 days', 2),

-- VB 5010: thượng khẩn, chờ xử lý ngay
(40012, 5010, 10001, 1002, 1001, 3,
 'PHAN_CONG', 'THƯỢNG KHẨN - Sự cố ATTT, cần chỉ đạo xử lý trong vòng 24 giờ',
 NOW(), NOW()+INTERVAL '1 day', 0),

-- VB đi 5012: bước 1 xong, bước 2 chờ admin duyệt
(40013, 5012, 10004, 1002, 1002, 3,
 'SOAN_THAO', 'Đã soạn thảo đề xuất nâng cấp hạ tầng, chuẩn bị trình duyệt',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '7 days', 2),
(40014, 5012, 10005, 1002, 1001, 3,
 'TRINH_DUYET', 'Kính trình phê duyệt đề xuất nâng cấp hạ tầng máy chủ',
 NOW()-INTERVAL '7 days', NOW()+INTERVAL '5 days', 0),

-- VB đi 5013: bước 1 xong, bước 2 chờ admin duyệt
(40015, 5013, 10004, 1002, 1002, 3,
 'SOAN_THAO', 'Đã soạn thảo báo cáo tổng kết quý I đầy đủ số liệu',
 NOW()-INTERVAL '5 days', NOW()-INTERVAL '2 days', 2),
(40016, 5013, 10005, 1002, 1001, 3,
 'TRINH_DUYET', 'Kính trình phê duyệt Báo cáo Quý I/2026 của Phòng CNTT',
 NOW()-INTERVAL '2 days', NOW()+INTERVAL '2 days', 0),

-- VB đi 5014: đã phê duyệt hoàn tất
(40017, 5014, 10001, 1001, 1001, 1,
 'PHE_DUYET', 'Đồng ý. Ban hành Quyết định khen thưởng theo danh sách đề xuất',
 NOW()-INTERVAL '33 days', NOW()-INTERVAL '20 days', 2),

-- VB đi 5015: đã phê duyệt hoàn tất
(40018, 5015, 10001, 1001, 1001, 1,
 'PHE_DUYET', 'Đồng ý phối hợp. Giao Phòng CNTT làm đầu mối liên hệ',
 NOW()-INTERVAL '16 days', NOW()-INTERVAL '8 days', 2),

-- VB đi 5017: bước 1 xong, bước 2 chờ admin duyệt khẩn
(40019, 5017, 10004, 1002, 1002, 3,
 'SOAN_THAO', 'Đã soạn thảo công văn phản hồi kiểm tra bảo mật',
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day', 2),
(40020, 5017, 10005, 1002, 1001, 3,
 'TRINH_DUYET', 'KHẨN - Kính trình phê duyệt gấp CV phản hồi bảo mật',
 NOW()-INTERVAL '1 day', NOW()+INTERVAL '1 day', 0),

-- VB đi 5018: đã hoàn tất
(40021, 5018, 10004, 1002, 1001, 3,
 'PHE_DUYET', 'Biên bản họp đã hoàn thiện, đồng ý lưu hồ sơ',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '2 days', 2);

-- =========================
-- 14. THÔNG BÁO
-- dadoc: FALSE=chưa đọc (badge đỏ), TRUE=đã đọc
-- =========================
INSERT INTO thongbao (id, tieude, noidung, nguoinhanid, vanbanid, loaithongbao, kenhgui, dadoc) VALUES
-- Thông báo cho icetruong (1002)
(60001, 'Văn bản mới cần xử lý: CV/2026/BTC-001',
  'Công văn phân bổ kinh phí Q2/2026 đã được tiếp nhận và đang chờ xử lý. Hạn xử lý trong 5 ngày tới.',
  1002, 5001, 'VAN_BAN', 'IN_APP', FALSE),

(60002, 'Văn bản KHẨN: CV/2026/SOKHDT-006',
  'Có 1 công văn KHẨN về tiến độ dự án cần xử lý trong ngày. Vui lòng xem và có ý kiến ngay.',
  1002, 5006, 'VAN_BAN', 'IN_APP', FALSE),

(60003, 'Văn bản THƯỢNG KHẨN: CV/2026/CATTT-010',
  'THƯỢNG KHẨN - Sự cố an toàn thông tin! Cần xử lý trong vòng 24 giờ. Liên hệ ngay Phòng CNTT.',
  1002, 5010, 'VAN_BAN', 'IN_APP', FALSE),

(60004, 'Báo cáo Q1 đang chờ Admin phê duyệt',
  'Báo cáo tổng kết Quý I/2026 (BC/2026/PCNTT-013) đã trình Admin. Vui lòng chờ kết quả phê duyệt.',
  1002, 5013, 'PHE_DUYET', 'IN_APP', FALSE),

(60005, 'CV phản hồi bảo mật đang chờ phê duyệt khẩn',
  'Công văn KHẨN CV/2026/PCNTT-017 đã trình Admin phê duyệt. Theo dõi kết quả để phản hồi đúng hạn.',
  1002, 5017, 'PHE_DUYET', 'IN_APP', FALSE),

(60006, 'Văn bản CV/2026/BKHDT-002 đã xử lý xong',
  'Công văn hướng dẫn lập kế hoạch đầu tư đã được Admin xem xét và chỉ đạo thực hiện.',
  1002, 5002, 'VAN_BAN', 'IN_APP', TRUE),

(60007, 'Văn bản CV/2026/PCNTT-011 đã phát hành',
  'Báo cáo triển khai QLVB điện tử đã được phê duyệt và phát hành thành công ngày ' || (NOW()-INTERVAL '20 days')::date || '.',
  1002, 5011, 'VAN_BAN', 'IN_APP', TRUE),

(60008, 'Hệ thống: Đăng nhập thành công',
  'Tài khoản icetruong đã đăng nhập hệ thống QLDA thành công qua Azure SSO.',
  1002, NULL, 'HE_THONG', 'IN_APP', TRUE),

-- Thông báo cho admin (1001)
(60009, 'Chờ phê duyệt: Đề xuất mua máy tính (5004)',
  'Đề xuất mua sắm máy tính xách tay của Phòng HC đang chờ bạn phê duyệt. Hạn: 7 ngày tới.',
  1001, 5004, 'PHE_DUYET', 'IN_APP', FALSE),

(60010, 'Chờ phê duyệt: Đề xuất nâng cấp hạ tầng (5012)',
  'Đề xuất nâng cấp máy chủ của Phòng CNTT đang chờ phê duyệt. Kinh phí dự kiến đã có dự toán đính kèm.',
  1001, 5012, 'PHE_DUYET', 'IN_APP', FALSE),

(60011, 'Chờ phê duyệt: Báo cáo Quý I/2026 (5013)',
  'Báo cáo tổng kết hoạt động Quý I/2026 của Phòng CNTT đang chờ bạn phê duyệt.',
  1001, 5013, 'PHE_DUYET', 'IN_APP', FALSE),

(60012, 'KHẨN - Chờ phê duyệt: CV bảo mật (5017)',
  'KHẨN - Công văn phản hồi kiểm tra bảo mật đang chờ phê duyệt gấp. Hạn phản hồi: ngày mai.',
  1001, 5017, 'PHE_DUYET', 'IN_APP', FALSE),

(60013, 'Văn bản KHẨN CV/2026/SOKHDT-006 cần chỉ đạo',
  'Công văn KHẨN của Sở KH&ĐT yêu cầu báo cáo tiến độ dự án đã được chuyển đến để có chỉ đạo.',
  1001, 5006, 'VAN_BAN', 'IN_APP', FALSE),

(60014, 'THƯỢNG KHẨN - Sự cố ATTT cần xử lý ngay',
  'CV thượng khẩn về sự cố an toàn thông tin từ Cục ATTT. Cần chỉ đạo xử lý ngay trong 24 giờ.',
  1001, 5010, 'VAN_BAN', 'IN_APP', FALSE),

(60015, 'Biên bản họp BGD (5008) quá hạn xử lý',
  'Biên bản họp BGD tháng 5 đã quá hạn xử lý 1 ngày. Vui lòng xem xét và có chỉ đạo.',
  1001, 5008, 'VAN_BAN', 'IN_APP', FALSE),

(60016, 'Văn bản CV/2026/BTC-001 đã tiếp nhận',
  'Công văn phân bổ kinh phí Q2/2026 đã được Phòng CNTT tiếp nhận và chuyển để xem xét.',
  1001, 5001, 'VAN_BAN', 'IN_APP', TRUE),

(60017, 'Hệ thống: Đăng nhập thành công',
  'Tài khoản Admin đã đăng nhập hệ thống QLDA thành công qua Azure SSO.',
  1001, NULL, 'HE_THONG', 'IN_APP', TRUE);

-- =========================
-- 15. LỊCH SỬ HỆ THỐNG (Audit Log)
-- =========================
INSERT INTO lichsuhethong (id, nguoidungid, hanhdong, doituong, doituongid, noidungchitiet, diachiip, trangthai) VALUES
(70001, 1002, 'DANG_NHAP',      'NguoiDung', 1002, 'icetruong đăng nhập qua Azure SSO thành công',                   '192.168.1.100', 1),
(70002, 1001, 'DANG_NHAP',      'NguoiDung', 1001, 'Admin đăng nhập qua Azure SSO thành công',                       '192.168.1.101', 1),
(70003, 1002, 'TAO_VAN_BAN',    'VanBan',    5012, 'Tạo công văn đề xuất nâng cấp hạ tầng CV/2026/PCNTT-012',       '192.168.1.100', 1),
(70004, 1002, 'TAO_VAN_BAN',    'VanBan',    5013, 'Tạo báo cáo tổng kết quý I BC/2026/PCNTT-013',                   '192.168.1.100', 1),
(70005, 1002, 'TAO_VAN_BAN',    'VanBan',    5017, 'Tạo công văn phản hồi bảo mật CV/2026/PCNTT-017',               '192.168.1.100', 1),
(70006, 1002, 'UPLOAD_FILE',    'VanBan',    5013, 'Upload báo cáo Q1/2026 (PDF + XLSX phụ lục số liệu)',            '192.168.1.100', 1),
(70007, 1002, 'UPLOAD_FILE',    'VanBan',    5012, 'Upload đề xuất nâng cấp hạ tầng + dự toán chi phí',              '192.168.1.100', 1),
(70008, 1002, 'CHUYEN_XU_LY',  'VanBan',    5001, 'Chuyển CV/2026/BTC-001 lên Admin để xem xét chỉ đạo',            '192.168.1.100', 1),
(70009, 1002, 'CHUYEN_XU_LY',  'VanBan',    5006, 'Chuyển CV khẩn SOKHDT-006 lên Admin để chỉ đạo khẩn',            '192.168.1.100', 1),
(70010, 1002, 'TRINH_DUYET',   'VanBan',    5013, 'Trình duyệt Báo cáo Quý I/2026 lên Admin',                       '192.168.1.100', 1),
(70011, 1002, 'TRINH_DUYET',   'VanBan',    5017, 'Trình duyệt khẩn CV phản hồi bảo mật lên Admin',                 '192.168.1.100', 1),
(70012, 1002, 'TRINH_DUYET',   'VanBan',    5012, 'Trình duyệt đề xuất nâng cấp hạ tầng lên Admin',                 '192.168.1.100', 1),
(70013, 1001, 'PHE_DUYET',     'VanBan',    5005, 'Admin phê duyệt: Thông báo hội nghị tổng kết 2025-2026',         '192.168.1.101', 1),
(70014, 1001, 'PHE_DUYET',     'VanBan',    5011, 'Admin phê duyệt: Báo cáo triển khai QLVB điện tử',               '192.168.1.101', 1),
(70015, 1001, 'PHE_DUYET',     'VanBan',    5014, 'Admin phê duyệt: Quyết định khen thưởng 2024-2025',              '192.168.1.101', 1),
(70016, 1001, 'PHE_DUYET',     'VanBan',    5015, 'Admin phê duyệt: CV phối hợp hội thảo quốc tế',                  '192.168.1.101', 1),
(70017, 1002, 'TAO_HO_SO',     'HoSo',      30001,'Tạo hồ sơ dự án nâng cấp hạ tầng CNTT 2026',                    '192.168.1.100', 1),
(70018, 1001, 'TAO_HO_SO',     'HoSo',      30003,'Tạo hồ sơ khen thưởng cá nhân tập thể xuất sắc 2025',           '192.168.1.101', 1),
(70019, 1001, 'XEM_BAO_CAO',   'BaoCao',    NULL, 'Admin xem báo cáo thống kê văn bản tháng 5/2026',                '192.168.1.101', 1),
(70020, 1001, 'XEM_AUDIT_LOG', 'LichSu',    NULL, 'Admin xem nhật ký hoạt động hệ thống',                            '192.168.1.101', 1),
(70021, 1001, 'QUAN_LY_USER',  'NguoiDung', 1002, 'Admin xem hồ sơ và phân quyền của icetruong',                    '192.168.1.101', 1),
(70022, 1002, 'XEM_VAN_BAN',   'VanBan',    5010, 'icetruong xem CV thượng khẩn ATTT-010',                           '192.168.1.100', 1),
(70023, 1002, 'XEM_VAN_BAN',   'VanBan',    5006, 'icetruong xem CV khẩn SOKHDT-006',                                '192.168.1.100', 1),
(70024, 1002, 'DANG_XUAT',     'NguoiDung', 1002, 'icetruong đăng xuất hệ thống',                                    '192.168.1.100', 1),
(70025, 1001, 'DANG_XUAT',     'NguoiDung', 1001, 'Admin đăng xuất hệ thống',                                        '192.168.1.101', 1);

-- =========================
-- 16. KẾT QUẢ AI
-- =========================
INSERT INTO ketquaai (id, vanbanid, nguoiyeucauid, loaixulyai, noidungdauvao, ketquatrave, dotincay, modelsudung) VALUES
(80001, 5001, 1002, 'SUMMARIZE',
  'Công văn về việc phân bổ kinh phí hoạt động quý II năm 2026 cho các phòng ban trực thuộc...',
  '{"summary":"Công văn phân bổ kinh phí Q2/2026. Tổng kinh phí: 850 triệu. Phân bổ cho 5 đơn vị theo tỷ lệ đề xuất. Hạn nộp kế hoạch chi tiết: 15/6/2026.","keyPoints":["Tổng ngân sách Q2: 850 triệu đồng","Hạn nộp kế hoạch: 15/6/2026","Liên hệ Phòng Tài chính để nhận hướng dẫn chi tiết"]}',
  0.92, 'gemini-1.5-flash'),

(80002, 5003, 1002, 'CLASSIFY',
  'Biên bản nghiệm thu hạng mục hạ tầng mạng nội bộ giai đoạn 1',
  '{"category":"BIEN_BAN","subCategory":"NGHIEM_THU","confidence":0.95,"tags":["hạ tầng","mạng","nghiệm thu","giai đoạn 1"],"recommendedWorkflow":"QT-NGHIEM-THU"}',
  0.95, 'gemini-1.5-flash'),

(80003, 5006, 1002, 'SUMMARIZE',
  'Công văn khẩn về việc báo cáo tiến độ dự án đầu tư xây dựng trọng điểm...',
  '{"summary":"Công văn KHẨN yêu cầu báo cáo tiến độ dự án ĐTXD. Hạn nộp: 3 ngày. Mẫu báo cáo theo Phụ lục I đính kèm.","urgency":"KHAN","deadline":"3 ngày kể từ ngày nhận"}',
  0.89, 'gemini-1.5-flash'),

(80004, 5013, 1002, 'SUMMARIZE',
  'Báo cáo tổng kết hoạt động và kết quả thực hiện nhiệm vụ quý I năm 2026 của Phòng CNTT...',
  '{"summary":"Báo cáo Q1/2026 Phòng CNTT: Hoàn thành 18/20 nhiệm vụ (90%). Đã triển khai thành công hệ thống QLVB điện tử. Kiến nghị tăng ngân sách Q2 cho hạ tầng máy chủ.","completionRate":90,"highlights":["Hệ thống QLVB đi vào hoạt động","Đào tạo 45 cán bộ sử dụng hệ thống","Tiết kiệm 60% thời gian xử lý văn bản"]}',
  0.94, 'gemini-1.5-flash'),

(80005, 5010, 1002, 'CLASSIFY',
  'Công văn thượng khẩn về sự cố an toàn thông tin hệ thống nội bộ',
  '{"category":"CONG_VAN","subCategory":"AN_TOAN_THONG_TIN","confidence":0.97,"urgency":"THUONG_KHAN","tags":["bảo mật","sự cố","ATTT","khẩn cấp"],"recommendedAction":"Báo cáo ngay lên BGĐ và có phương án xử lý trong 24h"}',
  0.97, 'gemini-1.5-flash');

-- =========================
-- 17. ỦY QUYỀN
-- =========================
INSERT INTO "UyQuyen" ("NguoiUyQuyenID", "NguoiDuocUyQuyenID", "TuNgay", "DenNgay", "PhamViUyQuyen", "GhiChu", "Active") VALUES
(1002, 1001,
 CURRENT_DATE - INTERVAL '30 days',
 CURRENT_DATE - INTERVAL '1 day',
 'Ký duyệt công văn thông thường trong kỳ nghỉ phép tháng 4/2026',
 'Đã hết hạn — đi nghỉ phép 29 ngày',
 FALSE),
(1002, 1001,
 CURRENT_DATE + INTERVAL '5 days',
 CURRENT_DATE + INTERVAL '15 days',
 'Ký duyệt toàn bộ công văn đến và đi trong thời gian đi công tác Hà Nội',
 'Đi công tác Hà Nội từ 5/6 đến 15/6/2026',
 TRUE);

-- =========================
-- 18. CẬP NHẬT SEQUENCE
-- =========================
SELECT setval(pg_get_serial_sequence('donvi','id'),          (SELECT MAX(id) FROM donvi));
SELECT setval(pg_get_serial_sequence('nhomquyen','id'),      (SELECT MAX(id) FROM nhomquyen));
SELECT setval(pg_get_serial_sequence('chucnang','id'),       (SELECT MAX(id) FROM chucnang));
SELECT setval(pg_get_serial_sequence('phanquyen','id'),      (SELECT MAX(id) FROM phanquyen));
SELECT setval(pg_get_serial_sequence('nguoidung','id'),      (SELECT MAX(id) FROM nguoidung));
SELECT setval(pg_get_serial_sequence('loaivanban','id'),     (SELECT MAX(id) FROM loaivanban));
SELECT setval(pg_get_serial_sequence('templatevanban','id'), (SELECT MAX(id) FROM templatevanban));
SELECT setval(pg_get_serial_sequence('quytrinh','id'),       (SELECT MAX(id) FROM quytrinh));
SELECT setval(pg_get_serial_sequence('buocquytrinh','id'),   (SELECT MAX(id) FROM buocquytrinh));
SELECT setval(pg_get_serial_sequence('vanban','id'),         (SELECT MAX(id) FROM vanban));
SELECT setval(pg_get_serial_sequence('tepdinhkem','id'),     (SELECT MAX(id) FROM tepdinhkem));
SELECT setval(pg_get_serial_sequence('hosocongviec','id'),   (SELECT MAX(id) FROM hosocongviec));
SELECT setval(pg_get_serial_sequence('xulyvanban','id'),     (SELECT MAX(id) FROM xulyvanban));
SELECT setval(pg_get_serial_sequence('thongbao','id'),       (SELECT MAX(id) FROM thongbao));
SELECT setval(pg_get_serial_sequence('lichsuhethong','id'),  (SELECT MAX(id) FROM lichsuhethong));
SELECT setval(pg_get_serial_sequence('ketquaai','id'),       (SELECT MAX(id) FROM ketquaai));
