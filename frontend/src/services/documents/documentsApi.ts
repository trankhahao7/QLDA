import { apiGet, apiPatch, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type DocumentListItem = {
  id: number;
  soKyHieu?: string;
  trichYeu: string;
  tenLoaiVanBan?: string;
  donViBanHanh?: string;
  ngayTiepNhan?: string;
  doKhan?: string;
  hanXuLy?: string;
  trangThai?: number;
};

export type DocumentDetail = {
  id: number;
  soKyHieu?: string;
  trichYeu: string;
  loaiVanBanId?: number;
  tenLoaiVanBan?: string;
  donViBanHanh?: string;
  nguoiKy?: string;
  ngayVanBan?: string;
  ngayTiepNhan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  hanXuLy?: string;
  trangThai?: number;
  daOCR?: boolean;
  daKySo?: boolean;
};

export const fetchIncomingDocuments = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  donViChuTriId?: number;
  trangThai?: number;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<DocumentListItem>>("/api/documents/incoming", { params });

export const fetchIncomingDetail = (id: number) =>
  apiGet<DocumentDetail>(`/api/documents/incoming/${id}`);

export const createIncomingDocument = (payload: {
  soKyHieu?: string;
  trichYeu: string;
  loaiVanBanId?: number;
  donViBanHanh?: string;
  nguoiKy?: string;
  ngayVanBan?: string;
  ngayTiepNhan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  hanXuLy?: string;
}) => apiPost<{ id: number }>("/api/documents/incoming", payload);

export const updateIncomingDocument = (id: number, payload: {
  soKyHieu?: string;
  trichYeu?: string;
  loaiVanBanId?: number;
  donViBanHanh?: string;
  nguoiKy?: string;
  ngayVanBan?: string;
  ngayTiepNhan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  hanXuLy?: string;
  trangThai?: number;
}) => apiPut<{ id: number }>(`/api/documents/incoming/${id}`, payload);

export const transferIncomingDocument = (id: number, payload: {
  nguoiNhanId: number;
  donViXuLyId: number;
  noiDungChuyen?: string;
  hanXuLy?: string;
}) => apiPost<{ documentId: number }>(`/api/documents/incoming/${id}/transfer`, payload);

export const uploadAttachment = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost<{ id: number; duongDanTep?: string }>(
    `/api/documents/${id}/attachments`,
    formData
  );
};

export const assignDocumentNumber = (id: number, soKyHieu: string) =>
  apiPatch<{ documentId: number }>(`/api/documents/${id}/number`, { soKyHieu });
