import { apiGet } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";
import type { DocumentListItem } from "../documents/documentsApi";

export const searchIncomingDocuments = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  donViChuTriId?: number;
  trangThai?: number;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<DocumentListItem>>("/api/documents/incoming", { params });
