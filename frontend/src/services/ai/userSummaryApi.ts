import { apiPost } from "../core/apiClient";

export const summarizeDocument = (payload: {
  documentId: number;
  text: string;
  summaryType?: string;
  language?: string;
}) => apiPost<{ documentId: number; summary: string; confidence?: number }>(
  "/api/ai/summarize",
  payload
);
