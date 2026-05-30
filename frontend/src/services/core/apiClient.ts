const DEFAULT_API_BASE_URL = "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken";

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

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
      signal: controller.signal,
    });

    const payload = await parseJson<ApiResponse<T>>(response);
    clearTimeout(timeoutId);

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
