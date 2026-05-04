import { apiDelete, apiGet, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type RoleItem = {
  id: number;
  maNhomQuyen: string;
  tenNhomQuyen: string;
  moTa?: string;
  suDung: boolean;
};

export const fetchRoles = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  suDung?: boolean;
}) => apiGet<PagedResponse<RoleItem>>("/api/auth/roles", { params });

export const fetchRoleDetail = (id: number) =>
  apiGet<RoleItem>(`/api/auth/roles/${id}`);

export const createRole = (payload: {
  maNhomQuyen: string;
  tenNhomQuyen: string;
  moTa?: string;
}) => apiPost<{ id: number }>("/api/auth/roles", payload);

export const updateRole = (id: number, payload: {
  maNhomQuyen?: string;
  tenNhomQuyen?: string;
  moTa?: string;
  suDung?: boolean;
}) => apiPut<{ id: number }>(`/api/auth/roles/${id}`, payload);

export const deleteRole = (id: number) =>
  apiDelete<{ id: number }>(`/api/auth/roles/${id}`);
