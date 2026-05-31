import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ApiError,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  getAccessToken,
  setAccessToken,
} from '../../services/core/apiClient';

// ─── helpers ────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
}

// ─── ApiError ─────��─────────────────────────────��───────────────────────────

describe('ApiError', () => {
  it('stores status and errorCode', () => {
    const err = new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    expect(err.message).toBe('Unauthorized');
    expect(err.status).toBe(401);
    expect(err.errorCode).toBe('UNAUTHORIZED');
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  it('works without errorCode', () => {
    const err = new ApiError('Not Found', 404);
    expect(err.errorCode).toBeUndefined();
  });
});

// ─── token storage ───────────────────────────────────────────────────────────

describe('token storage', () => {
  beforeEach(() => sessionStorage.clear());

  it('getAccessToken returns empty string when nothing stored', () => {
    expect(getAccessToken()).toBe('');
  });

  it('setAccessToken then getAccessToken round-trips', () => {
    setAccessToken('my-token-123');
    expect(getAccessToken()).toBe('my-token-123');
  });
});

// ─── apiRequest — success ────────────────────────────────────��───────────────

describe('apiRequest — success', () => {
  beforeEach(() => sessionStorage.clear());

  it('returns payload.data on 200', async () => {
    mockFetch(200, { success: true, message: 'OK', data: { id: 1 } });
    const result = await apiGet<{ id: number }>('/api/test');
    expect(result).toEqual({ id: 1 });
  });

  it('sends Authorization header when token is set', async () => {
    setAccessToken('bearer-abc');
    mockFetch(200, { success: true, message: 'OK', data: {} });
    await apiGet('/api/secure');
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer bearer-abc');
  });

  it('omits Authorization when auth=false', async () => {
    setAccessToken('should-not-appear');
    mockFetch(200, { success: true, message: 'OK', data: {} });
    await apiRequest('/api/public', { auth: false });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('sets Content-Type: application/json for JSON body', async () => {
    mockFetch(200, { success: true, message: 'OK', data: {} });
    await apiPost('/api/login', { username: 'admin' });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('does NOT set Content-Type for FormData', async () => {
    mockFetch(200, { success: true, message: 'OK', data: {} });
    const fd = new FormData();
    fd.append('file', new Blob(['data']), 'test.txt');
    await apiPost('/api/upload', fd);
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('serialises query params correctly', async () => {
    mockFetch(200, { success: true, message: 'OK', data: [] });
    await apiGet('/api/docs', { params: { page: 0, size: 10, keyword: 'test' } });
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(url).toContain('page=0');
    expect(url).toContain('size=10');
    expect(url).toContain('keyword=test');
  });

  it('skips null/undefined/empty-string params', async () => {
    mockFetch(200, { success: true, message: 'OK', data: [] });
    await apiGet('/api/docs', { params: { keyword: null, page: undefined, size: '' as unknown as number } });
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(url).not.toContain('keyword');
    expect(url).not.toContain('page');
    expect(url).not.toContain('size');
  });
});

// ─── apiRequest — errors ──────────────────────────────────────────────────────

describe('apiRequest — errors', () => {
  it('throws ApiError with server message on 401', async () => {
    mockFetch(401, { success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
    await expect(apiGet('/api/secure')).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
      errorCode: 'UNAUTHORIZED',
    });
  });

  it('throws ApiError with statusText when payload is null', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.reject(new SyntaxError('bad json')),
    } as unknown as Response);
    await expect(apiGet('/api/down')).rejects.toMatchObject({
      status: 503,
      message: 'Service Unavailable',
    });
  });

  it('throws ApiError with status 0 on network failure', async () => {
    mockFetchNetworkError();
    await expect(apiGet('/api/offline')).rejects.toMatchObject({
      status: 0,
      message: 'Network error',
    });
  });

  it('throws ApiError 408 on timeout (AbortError)', async () => {
    const abortErr = new DOMException('The operation was aborted.', 'AbortError');
    global.fetch = vi.fn().mockRejectedValue(abortErr);
    await expect(apiRequest('/api/slow', { timeoutMs: 1 })).rejects.toMatchObject({
      status: 408,
      message: 'Request timeout',
    });
  });

  it('throws ApiError when success=false even on HTTP 200', async () => {
    mockFetch(200, { success: false, message: 'Business error', errorCode: 'DUPLICATE' });
    await expect(apiPost('/api/create', {})).rejects.toMatchObject({
      status: 200,
      errorCode: 'DUPLICATE',
    });
  });
});

// ─── HTTP method helpers ──────────────────────────────────────────────────────

describe('HTTP method helpers', () => {
  beforeEach(() => {
    mockFetch(200, { success: true, message: 'OK', data: null });
  });

  it('apiGet uses GET', async () => {
    await apiGet('/api/x');
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('GET');
  });

  it('apiPost uses POST', async () => {
    await apiPost('/api/x', {});
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
  });

  it('apiPut uses PUT', async () => {
    await apiPut('/api/x', {});
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PUT');
  });

  it('apiPatch uses PATCH', async () => {
    await apiPatch('/api/x', {});
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PATCH');
  });

  it('apiDelete uses DELETE', async () => {
    await apiDelete('/api/x');
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('DELETE');
  });
});
