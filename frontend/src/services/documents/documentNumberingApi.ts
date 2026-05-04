import { apiGet, apiPost } from "../core/apiClient";

export const generateDocumentNumber = (payload: {
  loaiVanBanId: number;
  donViId: number;
  nam: number;
}) => apiPost<{ soKyHieu: string }>("/api/documents/numbering/generate", payload);

export const checkDocumentNumber = (soKyHieu: string) =>
  apiGet<{ soKyHieu: string; exists: boolean }>(
    "/api/documents/numbering/check",
    { params: { soKyHieu } }
  );
