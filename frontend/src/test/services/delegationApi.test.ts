import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDelegations, createDelegation, cancelDelegation } from '../../services/workflows/delegationApi';
import * as apiClient from '../../services/core/apiClient';

vi.mock('../../services/core/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof apiClient>();
  return { ...actual, apiGet: vi.fn(), apiPost: vi.fn(), apiDelete: vi.fn() };
});

const mockedGet = vi.mocked(apiClient.apiGet);
const mockedPost = vi.mocked(apiClient.apiPost);
const mockedDelete = vi.mocked(apiClient.apiDelete);

beforeEach(() => vi.clearAllMocks());

const baseDelegation = {
  id: 10,
  nguoiUyQuyenId: 1001,
  nguoiDuocUyQuyenId: 1002,
  tuNgay: '2026-06-01',
  denNgay: '2026-06-30',
  phamViUyQuyen: 'Ký duyệt',
  active: true,
};

describe('fetchDelegations', () => {
  it('calls GET /api/workflows/delegations with params', async () => {
    mockedGet.mockResolvedValue({ content: [baseDelegation], totalElements: 1, totalPages: 1, number: 0, size: 10 });

    const result = await fetchDelegations({ nguoiUyQuyenId: 1001, size: 10 });

    expect(mockedGet).toHaveBeenCalledWith('/api/workflows/delegations', {
      params: { nguoiUyQuyenId: 1001, size: 10 },
    });
    expect(result.content[0].id).toBe(10);
  });

  it('calls without params when none given', async () => {
    mockedGet.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
    await fetchDelegations();
    expect(mockedGet).toHaveBeenCalledWith('/api/workflows/delegations', { params: undefined });
  });
});

describe('createDelegation', () => {
  it('posts payload and returns created delegation', async () => {
    mockedPost.mockResolvedValue(baseDelegation);

    const payload = {
      nguoiUyQuyenId: 1001,
      nguoiDuocUyQuyenId: 1002,
      tuNgay: '2026-06-01',
      denNgay: '2026-06-30',
      phamViUyQuyen: 'Ký duyệt',
      ghiChu: 'Test note',
    };
    const result = await createDelegation(payload);

    expect(mockedPost).toHaveBeenCalledWith('/api/workflows/delegations', payload);
    expect(result).toEqual(baseDelegation);
  });

  it('works without optional fields', async () => {
    mockedPost.mockResolvedValue({ ...baseDelegation, phamViUyQuyen: null });
    const result = await createDelegation({
      nguoiUyQuyenId: 1001,
      nguoiDuocUyQuyenId: 1002,
      tuNgay: '2026-06-01',
      denNgay: '2026-06-30',
    });
    expect(result.phamViUyQuyen).toBeNull();
  });

  it('propagates error from server', async () => {
    mockedPost.mockRejectedValue(new apiClient.ApiError('Bad Request', 400, 'INVALID_REQUEST'));
    await expect(createDelegation({
      nguoiUyQuyenId: 1001,
      nguoiDuocUyQuyenId: 1002,
      tuNgay: '2026-06-30',
      denNgay: '2026-06-01',
    })).rejects.toMatchObject({ status: 400, errorCode: 'INVALID_REQUEST' });
  });
});

describe('cancelDelegation', () => {
  it('calls DELETE /api/workflows/delegations/:id', async () => {
    mockedDelete.mockResolvedValue({ id: 10 });

    const result = await cancelDelegation(10);

    expect(mockedDelete).toHaveBeenCalledWith('/api/workflows/delegations/10');
    expect(result).toEqual({ id: 10 });
  });

  it('propagates 404 when delegation not found', async () => {
    mockedDelete.mockRejectedValue(new apiClient.ApiError('Not Found', 404));
    await expect(cancelDelegation(999)).rejects.toMatchObject({ status: 404 });
  });
});
