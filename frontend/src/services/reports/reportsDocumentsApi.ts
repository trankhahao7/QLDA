import { apiGet } from "../core/apiClient";

export type DocumentStatisticsItem = {
  label: string;
  value: number;
};

export const fetchDocumentStatistics = (params?: {
  fromDate?: string;
  toDate?: string;
  donViId?: number;
  groupBy?: string;
}) => apiGet<{ groupBy: string; items: DocumentStatisticsItem[] }>(
  "/api/reports/documents/statistics",
  { params }
);
