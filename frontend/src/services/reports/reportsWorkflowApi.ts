import { apiGet } from "../core/apiClient";

export const fetchWorkflowProgress = (params?: {
  fromDate?: string;
  toDate?: string;
  donViId?: number;
  nguoiXuLyId?: number;
}) => apiGet<{ totalTasks: number; completedTasks: number; processingTasks: number; overdueTasks: number }>(
  "/api/reports/workflows/progress",
  { params }
);

export const fetchOverdueDocuments = (params?: {
  donViId?: number;
  nguoiXuLyId?: number;
  page?: number;
  size?: number;
}) => apiGet<{ content: Array<{ documentId: number; soKyHieu: string; trichYeu: string; soNgayTre: number }>; page: number; size: number; totalElements: number }>(
  "/api/reports/overdue-documents",
  { params }
);
