import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPendingApprovals } from '../../services/workflows/approvalsApi';
import * as apiClient from '../../services/core/apiClient';

vi.mock('../../services/core/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof apiClient>();
  return { ...actual, apiGet: vi.fn() };
});

const mockedGet = vi.mocked(apiClient.apiGet);

beforeEach(() => vi.clearAllMocks());

const approval = {
  processingId: 100,
  documentId: 5001,
  soKyHieu: 'VB-001',
  trichYeu: 'Công văn về kinh phí',
  nguoiGuiId: 1001,
  nguoiGuiTen: 'Trần Khả Hào',
  ngayNhan: '2026-05-01T08:00:00',
  hanXuLy: '2026-06-01T00:00:00',
  trangThaiXuLy: 1,
};

describe('fetchPendingApprovals', () => {
  it('fetches pending approvals without params', async () => {
    mockedGet.mockResolvedValue({ content: [approval], totalElements: 1, totalPages: 1, number: 0, size: 10 });

    const result = await fetchPendingApprovals();

    expect(mockedGet).toHaveBeenCalledWith('/api/workflows/approvals/pending', { params: undefined });
    expect(result.content[0].processingId).toBe(100);
    expect(result.content[0].soKyHieu).toBe('VB-001');
  });

  it('sends all filter params when provided', async () => {
    mockedGet.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });

    await fetchPendingApprovals({
      page: 0,
      size: 20,
      nguoiDuyetId: 1001,
      keyword: 'kinh phí',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
    });

    expect(mockedGet).toHaveBeenCalledWith('/api/workflows/approvals/pending', {
      params: {
        page: 0,
        size: 20,
        nguoiDuyetId: 1001,
        keyword: 'kinh phí',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
      },
    });
  });

  it('returns empty list when no approvals pending', async () => {
    mockedGet.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
    const result = await fetchPendingApprovals({ nguoiDuyetId: 9999 });
    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
  });

  it('propagates ApiError on unauthorized access', async () => {
    mockedGet.mockRejectedValue(new apiClient.ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    await expect(fetchPendingApprovals()).rejects.toMatchObject({
      status: 401,
      errorCode: 'UNAUTHORIZED',
    });
  });

  it('propagates network error', async () => {
    mockedGet.mockRejectedValue(new apiClient.ApiError('Network error', 0));
    await expect(fetchPendingApprovals()).rejects.toMatchObject({ status: 0 });
  });
});
