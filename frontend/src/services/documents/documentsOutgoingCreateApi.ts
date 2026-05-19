import { apiPost, apiPut } from "../core/apiClient";

export const createOutgoingDocument = (payload: {
  soKyHieu?: string;
  trichYeu: string;
  loaiVanBanId?: number;
  nguoiKy?: string;
  ngayVanBan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
}) => apiPost<{ id: number }>("/api/documents/outgoing", payload);

export const updateOutgoingDocument = (id: number, payload: {
  soKyHieu?: string;
  trichYeu?: string;
  loaiVanBanId?: number;
  nguoiKy?: string;
  ngayVanBan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  trangThai?: number;
}) => apiPut<{ id: number }>(`/api/documents/outgoing/${id}`, payload);
