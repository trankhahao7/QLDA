import { apiPost } from "../core/apiClient";

export const login = (payload: {
  username: string;
  password: string;
}) => apiPost<{ accessToken: string; refreshToken?: string; expiresIn?: number }>(
  "/api/auth/login",
  payload,
  { auth: false }
);
