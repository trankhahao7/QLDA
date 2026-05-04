import { apiPost } from "../core/apiClient";

export const submitIncomingTransfer = (id: number, payload: {
  nguoiNhanId: number;
  donViXuLyId: number;
  noiDungChuyen?: string;
  hanXuLy?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/incoming/${id}/transfer`,
  payload
);
