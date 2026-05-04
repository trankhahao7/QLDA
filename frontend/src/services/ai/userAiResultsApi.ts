import { apiGet } from "../core/apiClient";

export type UserAiResult = {
  id: number;
  documentId: number;
  loaiXuLyAI: string;
  ketQuaTraVe: string;
  doTinCay?: number;
};

export const fetchDocumentAiResults = (documentId: number, loaiXuLyAI?: string) =>
  apiGet<UserAiResult[]>(`/api/ai/results/documents/${documentId}`, {
    params: { loaiXuLyAI },
  });
