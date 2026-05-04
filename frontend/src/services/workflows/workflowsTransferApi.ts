import { apiPost } from "../core/apiClient";

export const transferDocument = (documentId: number, payload: {
  nguoiGuiId: number;
  nguoiNhanId: number;
  donViXuLyId: number;
  buocQuyTrinhId?: number;
  hanhDongXuLy?: string;
  yKienXuLy?: string;
  hanXuLy?: string;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/documents/${documentId}/transfer`,
  payload
);

export const receiveProcessing = (processingId: number, payload: {
  nguoiNhanId: number;
  ghiChu?: string;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/processings/${processingId}/receive`,
  payload
);

export const completeProcessing = (processingId: number, payload: {
  yKienXuLy?: string;
  tepKetQua?: string;
  tyLeHoanThanh?: number;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/processings/${processingId}/complete`,
  payload
);
