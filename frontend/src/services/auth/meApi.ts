import { apiPut } from "../core/apiClient";

export const updateMyProfile = (id: number, payload: {
  hoTen?: string;
  email?: string;
  donViId?: number;
}) => apiPut<{ id: number }>(`/api/auth/users/${id}`, payload);
