import { apiGet, apiPost } from "../core/apiClient";

export type AuthUser = {
  id: number;
  username: string;
  hoTen: string;
  email: string;
  donViId?: number;
  nhomQuyenId?: number;
  roles?: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
};

export const getCurrentUser = () =>
  apiGet<AuthUser>("/api/auth/me");

export const refreshToken = (refreshTokenValue: string) =>
  apiPost<AuthTokens>("/api/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  });

export const loginAzure = (authorizationCode: string, redirectUri: string) =>
  apiPost<AuthTokens & { user: AuthUser }>("/api/auth/login/azure", {
    authorizationCode,
    redirectUri,
  }, { auth: false });
