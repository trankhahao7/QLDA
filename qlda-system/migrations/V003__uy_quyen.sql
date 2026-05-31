CREATE TABLE IF NOT EXISTS uyquyen (
    id                   BIGSERIAL PRIMARY KEY,
    nguoiuyquyenid       BIGINT    NOT NULL,
    nguoiduocuyquyenid   BIGINT    NOT NULL,
    tungay               DATE      NOT NULL,
    denngay              DATE      NOT NULL,
    phamviuyquyen        VARCHAR(100),
    ghichu               TEXT,
    active               BOOLEAN   NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_uyquyen_nguoi_uy   ON uyquyen (nguoiuyquyenid);
CREATE INDEX IF NOT EXISTS idx_uyquyen_nguoi_duoc ON uyquyen (nguoiduocuyquyenid);
