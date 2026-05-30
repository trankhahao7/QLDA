-- Migration V002: Digital signature audit table
-- Run manually against the QLDA database (ddl-auto: none)

CREATE TABLE IF NOT EXISTS "ChuKySo" (
    "ID"        BIGSERIAL PRIMARY KEY,
    "VanBanID"  BIGINT    NOT NULL,
    "NguoiKyID" BIGINT,
    "NgayKy"    TIMESTAMP NOT NULL,
    "LoaiKy"    VARCHAR(50),
    "GhiChu"    TEXT,
    "HashFile"  VARCHAR(64),
    "CertInfo"  TEXT
);

CREATE INDEX IF NOT EXISTS idx_chukySo_vanBanId ON "ChuKySo" ("VanBanID");
