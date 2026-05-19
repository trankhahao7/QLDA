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
