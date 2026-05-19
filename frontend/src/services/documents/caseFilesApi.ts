import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type CaseFileItem = {
  id: number;
  maHoSo: string;
  tenHoSo: string;
  nguoiPhuTrachId?: number;
  donViId?: number;
  trangThai?: number;
};

export const fetchCaseFiles = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  donViId?: number;
  nguoiPhuTrachId?: number;
  trangThai?: number;
}) => apiGet<PagedResponse<CaseFileItem>>(
  "/api/documents/case-files",
  { params }
);

export const fetchCaseFileDetail = (id: number) =>
  apiGet<CaseFileItem>(`/api/documents/case-files/${id}`);

export const createCaseFile = (payload: {
  maHoSo: string;
  tenHoSo: string;
  vanBanId?: number;
  nguoiPhuTrachId?: number;
  donViId?: number;
  trangThai?: number;
  ghiChu?: string;
}) => apiPost<{ id: number }>("/api/documents/case-files", payload);

export const updateCaseFile = (id: number, payload: {
  tenHoSo?: string;
  nguoiPhuTrachId?: number;
  donViId?: number;
  trangThai?: number;
  ghiChu?: string;
}) => apiPut<{ id: number }>(`/api/documents/case-files/${id}`, payload);

export const attachDocumentToCaseFile = (id: number, vanBanId: number) =>
  apiPost<{ caseFileId: number; vanBanId: number }>(
    `/api/documents/case-files/${id}/documents`,
    { vanBanId }
  );

export const deleteCaseFile = (id: number) =>
  apiDelete<{ id: number }>(`/api/documents/case-files/${id}`);

export const classifyCaseFile = (id: number, payload: {
  nhomHoSo: string;
  ghiChu?: string;
}) => apiPatch<{ caseFileId: number }>(
  `/api/documents/case-files/${id}/classification`,
  payload
);
