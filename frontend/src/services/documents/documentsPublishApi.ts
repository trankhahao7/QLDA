import { apiGet, apiPost } from "../core/apiClient";

export type SignatureInfo = {
  documentId: number;
  nguoiKyId: number | null;
  ngayKy: string;
  loaiKy: string | null;
  ghiChu: string | null;
  hashFile: string | null;
  certInfo: string | null;
};

export const signDocument = (documentId: number, payload: {
  nguoiKyId: number;
  signatureType?: string;
  ghiChu?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/${documentId}/digital-sign`,
  payload
);

export const publishDocument = (documentId: number, payload: {
  ngayPhatHanh: string;
  noiDungPhatHanh?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/${documentId}/publish`,
  payload
);

export const sendDocument = (documentId: number, payload: {
  nguoiNhanIds?: number[];
  donViNhanIds?: number[];
  kenhGui?: string;
  noiDung?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/${documentId}/send`,
  payload
);

export const getOneDriveEditUrl = (documentId: number) =>
  apiGet<string>(`/api/documents/${documentId}/onedrive-edit-url`);

export const getSignatureInfo = (documentId: number) =>
  apiGet<SignatureInfo>(`/api/documents/${documentId}/signature-info`);
