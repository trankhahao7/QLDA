import { apiPost } from "../core/apiClient";

export const submitOutgoingApproval = (id: number, payload: {
  nguoiPheDuyetId: number;
  noiDungTrinh?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/outgoing/${id}/submit-approval`,
  payload
);
