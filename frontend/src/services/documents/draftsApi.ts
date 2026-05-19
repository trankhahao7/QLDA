import { apiPost, apiPut } from "../core/apiClient";

export const createDraft = (payload: {
  trichYeu: string;
  loaiVanBanId?: number;
  donViChuTriId?: number;
  noiDung?: string;
}) => apiPost<{ id: number }>("/api/documents/drafts", payload);

export const updateDraft = (id: number, payload: {
  trichYeu?: string;
  noiDung?: string;
  loaiVanBanId?: number;
  donViChuTriId?: number;
}) => apiPut<{ id: number }>(`/api/documents/drafts/${id}`, payload);

export const requestDraftComments = (id: number, payload: {
  nguoiNhanIds: number[];
  noiDung?: string;
}) => apiPost<{ documentId: number }>(`/api/documents/drafts/${id}/comments/request`, payload);

export const submitDraftSigning = (id: number, payload: {
  nguoiKyId: number;
  noiDungTrinhKy?: string;
}) => apiPost<{ documentId: number }>(`/api/documents/drafts/${id}/submit-signing`, payload);
