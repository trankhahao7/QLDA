import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchIncomingDocuments,
  fetchIncomingDetail,
  createIncomingDocument,
  updateIncomingDocument,
  transferIncomingDocument,
  uploadAttachment,
} from '../../services/documents/documentsApi';
import * as apiClient from '../../services/core/apiClient';

vi.mock('../../services/core/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof apiClient>();
  return { ...actual, apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiPatch: vi.fn() };
});

const mockedGet = vi.mocked(apiClient.apiGet);
const mockedPost = vi.mocked(apiClient.apiPost);
const mockedPut = vi.mocked(apiClient.apiPut);

beforeEach(() => vi.clearAllMocks());

const docItem = {
  id: 5001,
  soKyHieu: 'VB-001',
  trichYeu: 'Công văn về kinh phí',
  doKhan: 'Trung bình',
  trangThai: 1,
};

const docDetail = {
  ...docItem,
  loaiVanBanId: 1,
  tenLoaiVanBan: 'Công văn',
  ngayVanBan: '2026-05-01',
  attachments: [],
};

// ─── fetchIncomingDocuments ───────────────────────────────────────────────────

describe('fetchIncomingDocuments', () => {
  it('calls GET /api/documents/incoming without params', async () => {
    mockedGet.mockResolvedValue({ content: [docItem], totalElements: 1, totalPages: 1, number: 0, size: 10 });

    const result = await fetchIncomingDocuments();

    expect(mockedGet).toHaveBeenCalledWith('/api/documents/incoming', { params: undefined });
    expect(result.content[0].id).toBe(5001);
  });

  it('passes all filter params', async () => {
    mockedGet.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });

    await fetchIncomingDocuments({ keyword: 'kinh phí', loaiVanBanId: 1, trangThai: 1, page: 0, size: 20 });

    expect(mockedGet).toHaveBeenCalledWith('/api/documents/incoming', {
      params: { keyword: 'kinh phí', loaiVanBanId: 1, trangThai: 1, page: 0, size: 20 },
    });
  });
});

// ─── fetchIncomingDetail ──────────────────────────────────────────────────────

describe('fetchIncomingDetail', () => {
  it('calls GET /api/documents/incoming/:id', async () => {
    mockedGet.mockResolvedValue(docDetail);

    const result = await fetchIncomingDetail(5001);

    expect(mockedGet).toHaveBeenCalledWith('/api/documents/incoming/5001');
    expect(result).toEqual(docDetail);
  });

  it('throws 404 when document not found', async () => {
    mockedGet.mockRejectedValue(new apiClient.ApiError('Not found', 404));
    await expect(fetchIncomingDetail(9999)).rejects.toMatchObject({ status: 404 });
  });
});

// ─── createIncomingDocument ───────────────────────────────────────────────────

describe('createIncomingDocument', () => {
  it('posts to /api/documents/incoming and returns id', async () => {
    mockedPost.mockResolvedValue({ id: 9999 });

    const payload = {
      soKyHieu: 'TEST-001',
      trichYeu: 'Văn bản test',
      loaiVanBanId: 1,
      donViChuTriId: 1,
    };
    const result = await createIncomingDocument(payload);

    expect(mockedPost).toHaveBeenCalledWith('/api/documents/incoming', payload);
    expect(result).toEqual({ id: 9999 });
  });
});

// ─── updateIncomingDocument ───────────────────────────────────────────────────

describe('updateIncomingDocument', () => {
  it('calls PUT /api/documents/incoming/:id', async () => {
    mockedPut.mockResolvedValue({ id: 5001 });

    await updateIncomingDocument(5001, { trichYeu: 'Cập nhật tiêu đề' });

    expect(mockedPut).toHaveBeenCalledWith('/api/documents/incoming/5001', { trichYeu: 'Cập nhật tiêu đề' });
  });
});

// ─── transferIncomingDocument ─────────────────────────────────────────────────

describe('transferIncomingDocument', () => {
  it('posts transfer payload to correct endpoint', async () => {
    mockedPost.mockResolvedValue({ documentId: 5001 });

    const payload = { nguoiNhanId: 1002, donViXuLyId: 1, noiDungChuyen: 'Chuyển xử lý', hanXuLy: '2026-06-30' };
    const result = await transferIncomingDocument(5001, payload);

    expect(mockedPost).toHaveBeenCalledWith('/api/documents/incoming/5001/transfer', payload);
    expect(result).toEqual({ documentId: 5001 });
  });
});

// ─── uploadAttachment ─────────────────────────────────────────────────────────

describe('uploadAttachment', () => {
  it('sends file as FormData to /api/documents/:id/attachments', async () => {
    mockedPost.mockResolvedValue({ id: 200, duongDanTep: '/files/test.pdf' });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadAttachment(5001, file);

    expect(mockedPost).toHaveBeenCalledWith(
      '/api/documents/5001/attachments',
      expect.any(FormData)
    );
    const [, body] = mockedPost.mock.calls[0] as [string, FormData];
    expect(body.get('file')).toBe(file);
    expect(result.id).toBe(200);
  });
});
