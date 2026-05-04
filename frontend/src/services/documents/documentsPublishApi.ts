import { apiPost } from "../core/apiClient";

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
