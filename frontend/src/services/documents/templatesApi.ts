import { apiDelete, apiGet, apiPost, apiPut } from "../core/apiClient";
import type { PagedResponse } from "../auth/usersApi";

export type TemplateItem = {
  id: number;
  maTemplate: string;
  tenTemplate: string;
  loaiVanBanId: number;
  tenLoaiVanBan?: string;
  noiDungMau?: string;
  tepMau?: string;
  suDung: boolean;
};

export const fetchTemplates = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  loaiVanBanId?: number;
  suDung?: boolean;
}) => apiGet<PagedResponse<TemplateItem>>("/api/documents/templates", { params });

export const fetchTemplateDetail = (id: number) =>
  apiGet<TemplateItem>(`/api/documents/templates/${id}`);

export const createTemplate = (payload: {
  maTemplate: string;
  tenTemplate: string;
  loaiVanBanId: number;
  noiDungMau?: string;
  tepMau?: string;
  suDung?: boolean;
}) => apiPost<{ id: number; maTemplate: string }>("/api/documents/templates", payload);

export const updateTemplate = (id: number, payload: {
  tenTemplate?: string;
  loaiVanBanId?: number;
  noiDungMau?: string;
  tepMau?: string;
  suDung?: boolean;
}) => apiPut<{ id: number }>(`/api/documents/templates/${id}`, payload);

export const deleteTemplate = (id: number) =>
  apiDelete<{ id: number }>(`/api/documents/templates/${id}`);

export const applyTemplate = (templateId: number, payload: {
  documentId: number;
  overwrite?: boolean;
}) => apiPost<{ documentId: number; applied: boolean }>(
  `/api/documents/templates/${templateId}/apply`,
  payload
);

export const createDocumentFromTemplate = (payload: {
  templateId: number;
  loaiVanBanId?: number;
  metadata?: Record<string, unknown>;
}) => apiPost<{ documentId: number; soKyHieu?: string }>(
  "/api/documents/from-template",
  payload
);
