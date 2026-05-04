import { apiGet } from "../core/apiClient";

export type DocumentStats = {
  totalDocuments: number;
  incomingDocuments: number;
  outgoingDocuments: number;
  items?: Array<{ label: string; value: number }>;
};

export const fetchInternalDocumentStatistics = (params?: {
  fromDate?: string;
  toDate?: string;
  donViId?: number;
  groupBy?: string;
}) => apiGet<DocumentStats>("/internal/documents/statistics", { params });
