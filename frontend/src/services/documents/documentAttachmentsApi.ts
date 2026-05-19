import { apiGet, apiDelete, getApiBaseUrl, getAccessToken } from "../core/apiClient";

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

export const downloadAttachmentFile = async (attachmentId: number): Promise<Blob> => {
  const url = `${getApiBaseUrl()}/api/documents/attachments/${attachmentId}/file`;
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Download failed");
  return response.blob();
};

export const triggerDownload = async (attachmentId: number, tenTep: string) => {
  const blob = await downloadAttachmentFile(attachmentId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tenTep;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getFileUrl = (attachmentId: number): string => {
  return `${getApiBaseUrl()}/api/documents/attachments/${attachmentId}/file`;
};
