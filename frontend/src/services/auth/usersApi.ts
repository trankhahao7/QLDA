import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../core/apiClient";

export type UserItem = {
  id: number;
  username: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  donViId?: number;
  tenDonVi?: string;
  chucVu?: string;
  nhomQuyenId?: number;
  tenNhomQuyen?: string;
  trangThai: number;
};

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const fetchUsers = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  donViId?: number;
  trangThai?: number;
}) => apiGet<PagedResponse<UserItem>>("/api/auth/users", { params });

export const fetchUserDetail = (id: number) =>
  apiGet<UserItem>(`/api/auth/users/${id}`);

export const createUser = (payload: {
  username: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  donViId?: number;
  chucVu?: string;
  nhomQuyenId?: number;
  azureAdId?: string;
}) => apiPost<{ id: number }>("/api/auth/users", payload);

export const updateUser = (id: number, payload: {
  hoTen?: string;
  email?: string;
  dienThoai?: string;
  donViId?: number;
  chucVu?: string;
  nhomQuyenId?: number;
  trangThai?: number;
}) => apiPut<{ id: number }>(`/api/auth/users/${id}`, payload);

export const updateUserStatus = (id: number, trangThai: number) =>
  apiPatch<{ id: number; trangThai: number }>(
    `/api/auth/users/${id}/status`,
    { trangThai }
  );

export const assignUserRole = (id: number, nhomQuyenId: number) =>
  apiPatch<{ userId: number; nhomQuyenId: number }>(
    `/api/auth/users/${id}/role`,
    { nhomQuyenId }
  );

export const deleteUser = (id: number) =>
  apiDelete<{ id: number }>(`/api/auth/users/${id}`);
