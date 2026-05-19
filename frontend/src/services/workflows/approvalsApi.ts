import { apiGet } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type PendingApprovalItem = {
  processingId: number;
  documentId: number;
  soKyHieu?: string;
  trichYeu: string;
  nguoiGuiId?: number;
  nguoiGuiTen?: string;
  ngayNhan?: string;
  hanXuLy?: string;
  trangThaiXuLy?: number;
};

export const fetchPendingApprovals = (params?: {
  page?: number;
  size?: number;
  nguoiDuyetId?: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<PendingApprovalItem>>(
  "/api/workflows/approvals/pending",
  { params }
);
