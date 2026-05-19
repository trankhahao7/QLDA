import { apiGet, apiPatch } from "../core/apiClient";

export type SlaItem = {
  workflowId: number;
  stepId: number;
  tenBuoc: string;
  thoiGianXuLy: number;
  donViThoiGian?: string;
};

export const fetchSlaList = (workflowId?: number) =>
  apiGet<SlaItem[]>("/api/workflows/sla", { params: { workflowId } });

export const updateStepSla = (workflowId: number, stepId: number, payload: {
  thoiGianXuLy: number;
  donViThoiGian?: string;
  ghiChu?: string;
}) => apiPatch<{ workflowId: number; stepId: number }>(
  `/api/workflows/${workflowId}/steps/${stepId}/sla`,
  payload
);
