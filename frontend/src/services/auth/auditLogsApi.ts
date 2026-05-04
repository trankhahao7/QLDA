import { apiGet } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type AuditLogItem = {
  id: number;
  thoiGianThucHien: string;
  nguoiDungId: number;
  hoTen?: string;
  hanhDong: string;
  doiTuong?: string;
  doiTuongId?: number;
  noiDungChiTiet?: string;
  diaChiIP?: string;
  trangThai?: number;
};

export const fetchAuditLogs = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}) => apiGet<PagedResponse<AuditLogItem>>("/api/auth/audit-logs", { params });
