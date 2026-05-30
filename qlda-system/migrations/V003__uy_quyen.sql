CREATE TABLE IF NOT EXISTS "UyQuyen" (
    "ID"                 BIGSERIAL PRIMARY KEY,
    "NguoiUyQuyenID"     BIGINT    NOT NULL,
    "NguoiDuocUyQuyenID" BIGINT    NOT NULL,
    "TuNgay"             DATE      NOT NULL,
    "DenNgay"            DATE      NOT NULL,
    "PhamViUyQuyen"      VARCHAR(100),
    "GhiChu"             TEXT,
    "Active"             BOOLEAN   NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_uyquyen_nguoi_uy   ON "UyQuyen" ("NguoiUyQuyenID");
CREATE INDEX IF NOT EXISTS idx_uyquyen_nguoi_duoc ON "UyQuyen" ("NguoiDuocUyQuyenID");
