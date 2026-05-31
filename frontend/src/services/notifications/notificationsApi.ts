import { apiDelete, apiGet, apiPatch } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type NotificationItem = {
  id: number;
  tieuDe: string;
  noiDung: string;
  loaiThongBao?: string;
  kenhGui?: string;
  daDoc: boolean;
  ngayGui?: string;
};

export const fetchNotifications = (params?: {
  nguoiNhanId?: number;
  daDoc?: boolean;
  page?: number;
  size?: number;
}) => apiGet<PagedResponse<NotificationItem>>("/api/notifications", { params });

export const markNotificationRead = (id: number, nguoiNhanId: number) =>
  apiPatch<{ notificationId: number; daDoc: boolean }>(
    `/api/notifications/${id}/read`,
    { nguoiNhanId }
  );

export const deleteNotification = (id: number) =>
  apiDelete<{ id: number }>(`/api/notifications/${id}`);
