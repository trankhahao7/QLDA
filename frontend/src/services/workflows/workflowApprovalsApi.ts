import { apiPost } from "../core/apiClient";

export const approveProcessing = (processingId: number, payload: {
  yKienXuLy?: string;
  chuyenBuocTiepTheo?: boolean;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/approvals/${processingId}/approve`,
  payload
);

export const rejectProcessing = (processingId: number, payload: {
  lyDoTuChoi?: string;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/approvals/${processingId}/reject`,
  payload
);

export const commentProcessing = (processingId: number, payload: {
  noiDungGopY: string;
}) => apiPost<{ processingId: number }>(
  `/api/workflows/approvals/${processingId}/comment`,
  payload
);
