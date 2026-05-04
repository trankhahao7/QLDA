import { apiGet, apiPut } from "../core/apiClient";

export type RolePermissionItem = {
  id: number;
  chucNangId: number;
  maChucNang: string;
  tenChucNang: string;
  isView: boolean;
  isCreate: boolean;
  isEdit: boolean;
  isDelete: boolean;
  isApprove: boolean;
};

export type RolePermissionsResponse = {
  roleId: number;
  maNhomQuyen: string;
  tenNhomQuyen: string;
  permissions: RolePermissionItem[];
};

export const fetchRolePermissions = (roleId: number) =>
  apiGet<RolePermissionsResponse>(`/api/auth/roles/${roleId}/permissions`);

export const updateRolePermissions = (
  roleId: number,
  permissions: Array<{
    chucNangId: number;
    isView: boolean;
    isCreate: boolean;
    isEdit: boolean;
    isDelete: boolean;
    isApprove: boolean;
  }>
) => apiPut<{ roleId: number; totalUpdated: number }>(
  `/api/auth/roles/${roleId}/permissions`,
  { permissions }
);
