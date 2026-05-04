import { apiDelete, apiGet } from "../core/apiClient";

export type AiResultItem = {
  id: number;
  documentId: number;
  loaiXuLyAI: string;
  ketQuaTraVe: string;
  doTinCay?: number;
  modelSuDung?: string;
  thoiGianXuLy?: string;
};

export const fetchAiResultsByDocument = (documentId: number, loaiXuLyAI?: string) =>
  apiGet<AiResultItem[]>(`/api/ai/results/documents/${documentId}`, {
    params: { loaiXuLyAI },
  });

export const fetchAiResultDetail = (id: number) =>
  apiGet<AiResultItem>(`/api/ai/results/${id}`);

export const deleteAiResult = (id: number) =>
  apiDelete<{ id: number }>(`/api/ai/results/${id}`);
