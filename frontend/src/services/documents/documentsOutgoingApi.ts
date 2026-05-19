import { apiGet } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";
import type { DocumentListItem } from "../documents/documentsApi";

export const fetchOutgoingDocuments = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  trangThai?: number;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<DocumentListItem>>("/api/documents/outgoing", { params });
