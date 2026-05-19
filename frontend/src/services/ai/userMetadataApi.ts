import { apiPost } from "../core/apiClient";

export const extractMetadata = (payload: {
  documentId: number;
  text: string;
  fields?: string[];
  language?: string;
}) => apiPost<{ documentId: number; metadata: Record<string, string>; confidence?: number }>(
  "/api/ai/metadata/extract",
  payload
);
