import { apiPost } from "../core/apiClient";

export const checkPermission = (payload: {
  userId: number;
  maChucNang: string;
  permission: string;
}) => apiPost<{ allowed: boolean; userId: number }>(
  "/internal/auth/permissions/check",
  payload
);
