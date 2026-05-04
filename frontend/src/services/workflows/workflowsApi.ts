import { apiDelete, apiGet, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type WorkflowItem = {
  id: number;
  maQuyTrinh: string;
  tenQuyTrinh: string;
  loaiVanBanId?: number;
  moTa?: string;
  soBuoc?: number;
  suDung: boolean;
};

export type WorkflowStep = {
  id: number;
  tenBuoc: string;
  thuTuBuoc: number;
  vaiTroXuLy?: string;
  thoiGianXuLy?: number;
  batBuocPheDuyet?: boolean;
  ghiChu?: string;
};

export type WorkflowDetail = WorkflowItem & {
  steps?: WorkflowStep[];
};

export const fetchWorkflows = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  suDung?: boolean;
}) => apiGet<PagedResponse<WorkflowItem>>("/api/workflows", { params });

export const fetchWorkflowDetail = (id: number) =>
  apiGet<WorkflowDetail>(`/api/workflows/${id}`);

export const createWorkflow = (payload: {
  maQuyTrinh: string;
  tenQuyTrinh: string;
  loaiVanBanId?: number;
  moTa?: string;
  suDung?: boolean;
}) => apiPost<{ id: number }>("/api/workflows", payload);

export const updateWorkflow = (id: number, payload: {
  tenQuyTrinh?: string;
  loaiVanBanId?: number;
  moTa?: string;
  suDung?: boolean;
}) => apiPut<{ id: number }>(`/api/workflows/${id}`, payload);

export const deleteWorkflow = (id: number) =>
  apiDelete<{ id: number }>(`/api/workflows/${id}`);

export const createWorkflowStep = (workflowId: number, payload: {
  tenBuoc: string;
  thuTuBuoc: number;
  vaiTroXuLy?: string;
  thoiGianXuLy?: number;
  batBuocPheDuyet?: boolean;
  ghiChu?: string;
}) => apiPost<{ id: number }>(`/api/workflows/${workflowId}/steps`, payload);

export const updateWorkflowStep = (
  workflowId: number,
  stepId: number,
  payload: {
    tenBuoc?: string;
    thuTuBuoc?: number;
    vaiTroXuLy?: string;
    thoiGianXuLy?: number;
    batBuocPheDuyet?: boolean;
    ghiChu?: string;
  }
) => apiPut<{ workflowId: number; stepId: number }>(
  `/api/workflows/${workflowId}/steps/${stepId}`,
  payload
);

export const deleteWorkflowStep = (workflowId: number, stepId: number) =>
  apiDelete<{ workflowId: number; stepId: number }>(
    `/api/workflows/${workflowId}/steps/${stepId}`
  );
