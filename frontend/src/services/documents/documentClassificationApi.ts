import { apiGet, apiPatch } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export const classifyCaseFiles = (caseFileId: number, payload: {
  nhomHoSo: string;
  ghiChu?: string;
}) => apiPatch<{ caseFileId: number }>(
  `/api/documents/case-files/${caseFileId}/classification`,
  payload
);

export const fetchCaseFilesByClassification = (params?: {
  nhomHoSo: string;
  page?: number;
  size?: number;
}) => apiGet<PagedResponse<{ id: number; maHoSo: string; tenHoSo: string; nhomHoSo: string }>>(
  "/api/documents/case-files/classification",
  { params }
);
