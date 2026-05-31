import { apiGet, apiPost } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";
import type { DocumentListItem } from "./documentsApi";

export const fetchInternalDocuments = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  trangThai?: number;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<DocumentListItem>>("/api/documents/internal", { params });

export const createInternalDocument = (payload: {
  trichYeu: string;
  soKyHieu?: string;
  loaiVanBanId?: number;
  donViBanHanh?: string;
  nguoiKy?: string;
  ngayVanBan?: string;
  doMat?: string;
  doKhan?: string;
  donViChuTriId?: number;
  hanXuLy?: string;
}) => apiPost<{ id: number }>("/api/documents/internal", payload);
