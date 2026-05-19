import { apiGet } from "../core/apiClient";

export const exportReport = (params: {
  reportType: string;
  format: string;
  fromDate?: string;
  toDate?: string;
  donViId?: number;
}) => apiGet<{ fileName: string; fileUrl: string }>("/api/reports/export", { params });
