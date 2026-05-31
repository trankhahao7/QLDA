const DEFAULT_API_BASE_URL = "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
};

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_BASE_URL;

export const getAccessToken = () =>
  sessionStorage.getItem(TOKEN_STORAGE_KEY) || "";

export const setAccessToken = (token: string) => {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getRefreshToken = () =>
  sessionStorage.getItem(REFRESH_TOKEN_KEY) || "";

export const setRefreshToken = (token: string) => {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = () => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

let refreshingPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  if (!refreshingPromise) {
    refreshingPromise = fetch(
      new URL("/api/auth/refresh-token", getApiBaseUrl()).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      }
    )
      .then(async (res) => {
        const payload = await res.json().catch(() => null) as ApiResponse<{
          accessToken: string;
          refreshToken?: string;
        }> | null;
        if (!res.ok || !payload?.success) throw new Error("refresh failed");
        setAccessToken(payload.data.accessToken);
        if (payload.data.refreshToken) setRefreshToken(payload.data.refreshToken);
        return payload.data.accessToken;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }

  return refreshingPromise;
}

type RequestOptions = {
  method?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  timeoutMs?: number;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = new URL(path, getApiBaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const parseJson = async <T,>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const apiRequest = async <T,>(
  path: string,
  {
    method = "GET",
    params,
    body,
    headers,
    auth = true,
    timeoutMs = 30000,
  }: RequestOptions = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    ...(headers || {}),
  };

  const token = auth ? getAccessToken() : "";
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;
  if (body && !isFormData) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
  }

  const bodyForFetch = body ? (isFormData ? body : JSON.stringify(body)) : undefined;

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: bodyForFetch,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 && auth && !path.includes("/refresh-token")) {
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        requestHeaders.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(buildUrl(path, params), {
          method,
          headers: requestHeaders,
          body: bodyForFetch,
        });
        const retryPayload = await parseJson<ApiResponse<T>>(retryResponse);
        if (!retryResponse.ok || !retryPayload?.success) {
          throw new ApiError(
            retryPayload?.message || retryResponse.statusText || "Request failed",
            retryResponse.status,
            retryPayload?.errorCode
          );
        }
        return retryPayload.data;
      }
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    const payload = await parseJson<ApiResponse<T>>(response);

    if (!response.ok || !payload?.success) {
      const message = payload?.message || response.statusText || "Request failed";
      throw new ApiError(message, response.status, payload?.errorCode);
    }

    return payload.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408);
    }
    throw new ApiError("Network error", 0);
  }
};

export const apiGet = <T,>(path: string, options?: Omit<RequestOptions, "method">) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "POST", body });

export const apiPut = <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "PUT", body });

export const apiPatch = <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "PATCH", body });

export const apiDelete = <T,>(path: string, options?: Omit<RequestOptions, "method">) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });
