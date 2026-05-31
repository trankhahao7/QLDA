import { apiPost } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type SemanticSearchItem = {
  documentId: number;
  soKyHieu?: string;
  trichYeu: string;
  score?: number;
  matchedText?: string;
};

export const semanticSearch = (payload: {
  keyword: string;
  userId: number;
  filters?: {
    loaiVanBanId?: number;
    donViId?: number;
    fromDate?: string;
    toDate?: string;
  };
  page?: number;
  size?: number;
}) => apiPost<PagedResponse<SemanticSearchItem>>("/api/ai/search/semantic", payload);

export const indexDocument = (payload: {
  documentId: number;
  content?: string;
  metadata?: Record<string, unknown>;
}) => apiPost<{ documentId: number; chunksCreated: number }>("/api/ai/search/index-document", payload);

export const deleteDocumentIndex = (documentId: number) =>
  apiDelete<{ documentId: number }>(`/api/ai/search/index-document/${documentId}`);
