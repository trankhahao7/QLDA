import { apiGet } from "../core/apiClient";

export type DashboardStats = {
  totalDocuments: number;
  incomingDocuments: number;
  outgoingDocuments: number;
  completedDocuments: number;
  processingDocuments: number;
  overdueDocuments: number;
  completionRate?: number;
  overdueRate?: number;
};

export const fetchDashboardStats = (params?: {
  fromDate?: string;
  toDate?: string;
  donViId?: number;
}) => apiGet<DashboardStats>("/api/reports/dashboard", { params });
