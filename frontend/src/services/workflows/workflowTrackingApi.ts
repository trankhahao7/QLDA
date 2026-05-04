import { apiGet } from "../core/apiClient";

export type WorkflowTimelineItem = {
  processingId: number;
  tenBuoc: string;
  nguoiXuLy?: string;
  nguoiXuLyId?: number;
  hanhDongXuLy?: string;
  yKienXuLy?: string;
  ngayNhan?: string;
  ngayHoanThanh?: string | null;
  trangThaiXuLy?: number;
};

export type WorkflowStatus = {
  documentId: number;
  currentStep?: string;
  trangThaiXuLy?: number;
  tyLeHoanThanh?: number;
  hanXuLy?: string;
  isOverdue?: boolean;
};

export const fetchWorkflowStatus = (documentId: number) =>
  apiGet<WorkflowStatus>(`/api/workflows/documents/${documentId}/status`);

export const fetchWorkflowTimeline = (documentId: number) =>
  apiGet<WorkflowTimelineItem[]>(`/api/workflows/documents/${documentId}/timeline`);
