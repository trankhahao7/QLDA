SET client_encoding = 'UTF8';

TRUNCATE ai_document_chunk;

INSERT INTO ai_document_chunk (van_ban_id, tep_dinh_kem_id, chunk_index, noi_dung, embedding, metadata)
VALUES

(5001, NULL, 0,
 'Huong dan dang nhap he thong QLDA: Truy cap https://portal.qlda.vn, nhap ten dang nhap va mat khau, nhan nut Dang nhap. Neu quen mat khau, nhan vao lien ket Quen mat khau de dat lai.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Huong dan dang nhap he thong"}'),

(5001, NULL, 1,
 'Cach tao van ban moi: Vao menu Van ban, chon Tao moi, chon loai van ban, nhap thong tin, dinh kem file, nhan Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Tao van ban moi"}'),

(5001, NULL, 2,
 'Huong dan tim kiem van ban: Su dung thanh tim kiem hoac vao menu Tra cuu. Co the tim theo so ky hieu, trich yeu, don vi ban hanh, loai van ban, khoang thoi gian.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Tim kiem van ban"}'),

(5001, NULL, 3,
 'Huong dan doi mat khau: Vao menu Ca nhan, chon Doi mat khau, nhap mat khau cu, nhap mat khau moi (8 ky tu co chu hoa thuong va so), xac nhan, nhan Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Doi mat khau"}'),

(5001, NULL, 4,
 'Cach trich xuat bao cao thong ke: Vao menu Bao cao, chon loai bao cao, chon tieu chi, nhan Xem bao cao. Co the xuat file Excel hoac PDF.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Trich xuat bao cao"}'),

(5001, NULL, 5,
 'Cach cap nhat thong tin ca nhan: Vao menu Ca nhan, chon Thong tin ca nhan, cap nhat ho ten email so dien thoai, nhan Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Cap nhat thong tin ca nhan"}'),

(5001, NULL, 6,
 'Cach xem lich su hoat dong: Vao menu Ca nhan, chon Lich su hoat dong. Xem danh sach cac thao tac da thuc hien kem thoi gian.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Xem lich su hoat dong"}'),

(5002, NULL, 0,
 'Quy trinh phe duyet van ban: Nguoi dung tao van ban, trinh len truong phong, truong phong xem xet, nhan Phe duyet hoac Tu choi.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "title": "Quy trinh phe duyet van ban"}'),

(5002, NULL, 1,
 'Cach trinh ky van ban: Mo van ban, nhan Trinh ky, chon nguoi ky, nhap y kien, dinh kem file scan neu can, nhan Gui.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Trinh ky van ban"}'),

(5002, NULL, 2,
 'Cach tu choi phe duyet: Mo van ban, nhan Tu choi, nhap ly do, nhan Xac nhan. Van ban tra ve nguoi tao.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Tu choi phe duyet"}'),

(5002, NULL, 3,
 'Cach chuyen tiep van ban: Mo van ban, nhan Chuyen tiep, chon nguoi nhan, nhap ghi chu, nhan Gui.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Chuyen tiep van ban"}'),

(5002, NULL, 4,
 'Cach xem danh sach van ban cho duyet: Vao menu Phe duyet, chon Cho duyet. Danh sach cac van ban dang cho phe duyet.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Xem danh sach cho duyet"}'),

(5002, NULL, 5,
 'Quy trinh ban hanh van ban: Sau khi phe duyet, van ban chuyen sang Cho ban hanh. Nguoi co quyen kiem tra va nhan Ban hanh. He thong gan so hieu tu dong.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "title": "Quy trinh ban hanh van ban"}'),

(5015, NULL, 0,
 'Cach tiep nhan van ban den: Vao menu Van ban den, nhan Tiep nhan, nhap so den ngay den, chon loai van ban, nhap trich yeu, dinh kem file, nhan Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Tiep nhan van ban den"}'),

(5015, NULL, 1,
 'Cach phan loai van ban den: Mo van ban, chon Phan loai, chon loai cong van quyet dinh chi thi, chon do khan, chon do mat, nhan Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Phan loai van ban den"}'),

(5015, NULL, 2,
 'Quy trinh xu ly van ban den: Tiep nhan, chuyen lanh dao xem xet, lanh dao giao chuyen vien xu ly, soan thao tra loi, trinh ky, ban hanh.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "quy_trinh", "title": "Quy trinh xu ly van ban den"}'),

(5016, NULL, 0,
 'Cach xem thong bao: Vao menu Thong bao, xem danh sach thong bao: van ban den han, qua han, yeu cau phe duyet, thay doi trang thai.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Xem thong bao he thong"}'),

(5016, NULL, 1,
 'He thong tu dong nhac viec khi van ban den han trong 3 ngay, van ban qua han, co van ban cho phe duyet, van ban bi tu choi. Thong bao tren giao dien va email.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "thong_bao", "title": "Nhac viec tu dong"}'),

(5016, NULL, 2,
 'Cach xem van ban qua han: Vao menu Bao cao, chon Van ban qua han. Xem danh sach kem so ngay qua han, nguoi xu ly, trang thai.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Xem van ban qua han"}'),

(5016, NULL, 3,
 'Cach thiet lap canh bao han xu ly: Vao menu Ca nhan, Cai dat, Canh bao, chon so ngay truoc han, chon kenh nhan thong bao, Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Thiet lap canh bao"}'),

(5017, NULL, 0,
 'Cach them nguoi dung moi: Vao menu Quan tri, Nguoi dung, Them moi. Nhap thong tin, chon vai tro, nhan Luu. Nguoi dung nhan email kich hoat.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Them nguoi dung moi"}'),

(5017, NULL, 1,
 'Cach phan quyen nguoi dung: Vao menu Quan tri, Phan quyen, chon nguoi dung va vai tro, danh dau cac quyen, Luu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Phan quyen nguoi dung"}'),

(5017, NULL, 2,
 'Cach quan ly don vi: Vao menu Quan tri, Don vi. Them sua don vi, xac dinh don vi cha, bo nhiem truong don vi. Hien thi dang cay.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Quan ly don vi"}'),

(5017, NULL, 3,
 'Cach xem nhat ky he thong Audit Log: Vao menu Quan tri, Nhat ky he thong. Xem tat ca hoat dong dang nhap tao van ban phe duyet phan quyen. Loc theo nguoi dung thoi gian.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Xem nhat ky he thong"}'),

(5017, NULL, 4,
 'Cach xem Dashboard: Vao Dashboard xem tong quan so van ban den di qua han cho duyet. Hien thi bieu do va so lieu.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Dashboard tong quan"}'),

(5017, NULL, 5,
 'Cach tich hop Office 365: Vao menu Quan tri, Tich hop, Office 365. Nhap Tenant ID Client ID Client Secret, chon dich vu can tich hop, nhan Ket noi.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Tich hop Office 365"}'),

(5017, NULL, 6,
 'Cach dang xuat khoi he thong: Nhan vao ten nguoi dung goc phai man hinh, chon Dang xuat. He thong xoa phien va chuyen ve man hinh dang nhap.',
 (SELECT array_fill(0::float, ARRAY[768])::vector),
 '{"type": "huong_dan", "title": "Dang xuat he thong"}');