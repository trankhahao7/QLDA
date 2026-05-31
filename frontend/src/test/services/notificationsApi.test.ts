import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNotifications, markNotificationRead, deleteNotification } from '../../services/notifications/notificationsApi';
import * as apiClient from '../../services/core/apiClient';

vi.mock('../../services/core/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof apiClient>();
  return { ...actual, apiGet: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn() };
});

const mockedGet = vi.mocked(apiClient.apiGet);
const mockedPatch = vi.mocked(apiClient.apiPatch);
const mockedDelete = vi.mocked(apiClient.apiDelete);

beforeEach(() => vi.clearAllMocks());

const notification = {
  id: 1,
  tieuDe: 'Văn bản mới',
  noiDung: 'Có văn bản cần xử lý',
  loaiThongBao: 'VAN_BAN',
  daDoc: false,
  ngayGui: '2026-05-31T10:00:00',
};

describe('fetchNotifications', () => {
  it('calls GET /api/notifications with nguoiNhanId', async () => {
    mockedGet.mockResolvedValue({ content: [notification], totalElements: 1, totalPages: 1, number: 0, size: 10 });

    const result = await fetchNotifications({ nguoiNhanId: 1001 });

    expect(mockedGet).toHaveBeenCalledWith('/api/notifications', { params: { nguoiNhanId: 1001 } });
    expect(result.content[0].tieuDe).toBe('Văn bản mới');
  });

  it('filters unread notifications with daDoc=false', async () => {
    mockedGet.mockResolvedValue({ content: [notification], totalElements: 1, totalPages: 1, number: 0, size: 10 });

    await fetchNotifications({ nguoiNhanId: 1001, daDoc: false });

    expect(mockedGet).toHaveBeenCalledWith('/api/notifications', {
      params: { nguoiNhanId: 1001, daDoc: false },
    });
  });

  it('returns empty when no notifications', async () => {
    mockedGet.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
    const result = await fetchNotifications({ nguoiNhanId: 9999 });
    expect(result.content).toHaveLength(0);
  });
});

describe('markNotificationRead', () => {
  it('patches /api/notifications/:id/read', async () => {
    mockedPatch.mockResolvedValue({ notificationId: 1, daDoc: true });

    const result = await markNotificationRead(1, 1001);

    expect(mockedPatch).toHaveBeenCalledWith('/api/notifications/1/read', { nguoiNhanId: 1001 });
    expect(result.daDoc).toBe(true);
  });
});

describe('deleteNotification', () => {
  it('deletes /api/notifications/:id', async () => {
    mockedDelete.mockResolvedValue({ id: 1 });

    const result = await deleteNotification(1);

    expect(mockedDelete).toHaveBeenCalledWith('/api/notifications/1');
    expect(result).toEqual({ id: 1 });
  });

  it('propagates error when delete fails', async () => {
    mockedDelete.mockRejectedValue(new apiClient.ApiError('Not found', 404));
    await expect(deleteNotification(999)).rejects.toMatchObject({ status: 404 });
  });
});
