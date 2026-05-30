import { apiDelete, apiGet, apiPost } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type DelegationItem = {
  id: number;
  nguoiUyQuyenId: number;
  nguoiDuocUyQuyenId: number;
  tuNgay: string;
  denNgay: string;
  phamViUyQuyen: string | null;
  active: boolean;
};

export const fetchDelegations = (params?: {
  nguoiUyQuyenId?: number;
  nguoiDuocUyQuyenId?: number;
  active?: boolean;
  page?: number;
  size?: number;
}) => apiGet<PagedResponse<DelegationItem>>("/api/workflows/delegations", { params });

export const createDelegation = (payload: {
  nguoiUyQuyenId: number;
  nguoiDuocUyQuyenId: number;
  tuNgay: string;
  denNgay: string;
  phamViUyQuyen?: string;
  ghiChu?: string;
}) => apiPost<DelegationItem>("/api/workflows/delegations", payload);

export const cancelDelegation = (id: number) =>
  apiDelete<{ id: number }>(`/api/workflows/delegations/${id}`);
