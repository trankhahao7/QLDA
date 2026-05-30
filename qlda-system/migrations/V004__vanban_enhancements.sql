-- Add OCR text storage
ALTER TABLE "VanBan" ADD COLUMN IF NOT EXISTS "NoiDungOCR" TEXT;

-- Add AI classification suggestion columns
ALTER TABLE "VanBan" ADD COLUMN IF NOT EXISTS "AiPhanLoai"  VARCHAR(100);
ALTER TABLE "VanBan" ADD COLUMN IF NOT EXISTS "AiConfidence" DOUBLE PRECISION;
