import { apiPost } from "../core/apiClient";

export const applyTemplate = (templateId: number, payload: {
  documentId: number;
  replaceData?: Record<string, string>;
}) => apiPost<{ documentId: number; templateId: number; content: string }>(
  `/api/documents/templates/${templateId}/apply`,
  payload
);

export const createDocumentFromTemplate = (payload: {
  templateId: number;
  trichYeu: string;
  loaiVanBanId: number;
  donViChuTriId: number;
  replaceData?: Record<string, string>;
}) => apiPost<{ documentId: number; templateId: number }>(
  "/api/documents/from-template",
  payload
);
