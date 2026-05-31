import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, refreshToken, loginAzure } from '../../services/auth/authApi';
import * as apiClient from '../../services/core/apiClient';

vi.mock('../../services/core/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof apiClient>();
  return {
    ...actual,
    apiGet: vi.fn(),
    apiPost: vi.fn(),
  };
});

const mockedGet = vi.mocked(apiClient.apiGet);
const mockedPost = vi.mocked(apiClient.apiPost);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('calls GET /api/auth/me and returns user', async () => {
    const user = { id: 1, username: 'admin', hoTen: 'Admin', email: 'a@b.com', roles: ['ADMIN'] };
    mockedGet.mockResolvedValue(user);

    const result = await getCurrentUser();

    expect(mockedGet).toHaveBeenCalledWith('/api/auth/me');
    expect(result).toEqual(user);
  });

  it('propagates ApiError from server', async () => {
    mockedGet.mockRejectedValue(new apiClient.ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    await expect(getCurrentUser()).rejects.toMatchObject({ status: 401, errorCode: 'UNAUTHORIZED' });
  });
});

describe('refreshToken', () => {
  it('calls POST /api/auth/refresh-token with correct body', async () => {
    const tokens = { accessToken: 'new-token', refreshToken: 'new-refresh' };
    mockedPost.mockResolvedValue(tokens);

    const result = await refreshToken('old-refresh');

    expect(mockedPost).toHaveBeenCalledWith(
      '/api/auth/refresh-token',
      { refreshToken: 'old-refresh' }
    );
    expect(result.accessToken).toBe('new-token');
  });

  it('throws on invalid refresh token', async () => {
    mockedPost.mockRejectedValue(new apiClient.ApiError('Invalid token', 401));
    await expect(refreshToken('bad-token')).rejects.toMatchObject({ status: 401 });
  });
});

describe('loginAzure', () => {
  it('posts authorization code without auth header', async () => {
    const response = { accessToken: 'tok', user: { id: 1, username: 'admin', hoTen: 'Admin', email: 'a@b.com' } };
    mockedPost.mockResolvedValue(response);

    const result = await loginAzure('auth-code-xyz', 'http://localhost:5173/callback', 'verifier-abc');

    expect(mockedPost).toHaveBeenCalledWith(
      '/api/auth/login/azure',
      { authorizationCode: 'auth-code-xyz', redirectUri: 'http://localhost:5173/callback', code_verifier: 'verifier-abc' },
      { auth: false }
    );
    expect(result.accessToken).toBe('tok');
  });

  it('uses empty string when codeVerifier is omitted', async () => {
    mockedPost.mockResolvedValue({ accessToken: 'tok', user: {} });
    await loginAzure('code', 'http://localhost:5173');
    const [, body] = mockedPost.mock.calls[0] as [string, Record<string, string>];
    expect(body.code_verifier).toBe('');
  });

  it('propagates AZURE_AUTH_FAILED error', async () => {
    mockedPost.mockRejectedValue(new apiClient.ApiError('Azure auth failed', 401, 'AZURE_AUTH_FAILED'));
    await expect(loginAzure('bad-code', 'http://localhost:5173')).rejects.toMatchObject({
      errorCode: 'AZURE_AUTH_FAILED',
    });
  });
});
