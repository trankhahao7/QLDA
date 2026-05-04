import { apiPost } from "../core/apiClient";

export const generateHandlingSuggestion = (payload: {
  documentId: number;
  text: string;
  context?: {
    loaiVanBan?: string;
    doKhan?: string;
    donViChuTri?: string;
  };
}) => apiPost<{ documentId: number; suggestions: Array<{ action: string; description: string; priority: string }> }>(
  "/api/ai/suggestions/handling",
  payload
);
