import { apiDelete, apiGet, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type UnitItem = {
  id: number;
  maDonVi: string;
  tenDonVi: string;
  donViChaId?: number | null;
  tenDonViCha?: string | null;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
  suDung: boolean;
};

export const fetchUnits = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  donViChaId?: number;
  suDung?: boolean;
}) => apiGet<PagedResponse<UnitItem>>("/api/auth/don-vi", { params });

export const fetchUnitTree = () =>
  apiGet<UnitItem[]>("/api/auth/don-vi/tree");

export const fetchUnitDetail = (id: number) =>
  apiGet<UnitItem>(`/api/auth/don-vi/${id}`);

export const createUnit = (payload: {
  maDonVi: string;
  tenDonVi: string;
  donViChaId?: number | null;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
}) => apiPost<{ id: number }>("/api/auth/don-vi", payload);

export const updateUnit = (id: number, payload: {
  maDonVi?: string;
  tenDonVi?: string;
  donViChaId?: number | null;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
  suDung?: boolean;
}) => apiPut<{ id: number }>(`/api/auth/don-vi/${id}`, payload);

export const deleteUnit = (id: number) =>
  apiDelete<{ id: number }>(`/api/auth/don-vi/${id}`);
