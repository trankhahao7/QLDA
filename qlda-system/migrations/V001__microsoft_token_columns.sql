-- Migration: Add Microsoft OAuth token storage to NguoiDung
-- Run once against the QLDA database before deploying Phase 3
ALTER TABLE "NguoiDung"
    ADD COLUMN IF NOT EXISTS "MicrosoftRefreshToken" TEXT,
    ADD COLUMN IF NOT EXISTS "MicrosoftTokenExpiry"  TIMESTAMP;

-- Note: VanBan already has DuongDanSharePoint (VARCHAR 500) and DuongDanOneDrive (VARCHAR 500)
-- defined in the entity. Run qlda.sql initial schema if these columns are missing.
