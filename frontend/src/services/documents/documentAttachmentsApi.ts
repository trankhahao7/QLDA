import { apiGet, apiDelete } from "../core/apiClient";

export type AttachmentItem = {
  id: number;
  tenTep: string;
  duongDanTep?: string;
  loaiTep?: string;
  kichThuoc?: number;
  ngayTaiLen?: string;
};

export const fetchAttachments = (documentId: number) =>
  apiGet<AttachmentItem[]>(`/api/documents/${documentId}/attachments`);

export const downloadAttachment = (attachmentId: number) =>
  apiGet<{ attachmentId: number; downloadUrl: string }>(
    `/api/documents/attachments/${attachmentId}/download`
  );

export const deleteAttachment = (attachmentId: number) =>
  apiDelete<{ attachmentId: number }>(`/api/documents/attachments/${attachmentId}`);
