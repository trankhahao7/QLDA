import { apiDelete, apiGet, apiPost, apiPut } from "../core/apiClient";

export type DocumentTypeItem = {
  id: number;
  maLoaiVanBan: string;
  tenLoaiVanBan: string;
  moTa?: string;
  suDung: boolean;
};

export const fetchDocumentTypes = (params?: {
  keyword?: string;
  suDung?: boolean;
}) => apiGet<DocumentTypeItem[]>("/api/documents/types", { params });

export const fetchDocumentTypeDetail = (id: number) =>
  apiGet<DocumentTypeItem>(`/api/documents/types/${id}`);

export const createDocumentType = (payload: {
  maLoaiVanBan: string;
  tenLoaiVanBan: string;
  moTa?: string;
  suDung?: boolean;
}) => apiPost<{ id: number; maLoaiVanBan: string }>("/api/documents/types", payload);

export const updateDocumentType = (id: number, payload: {
  tenLoaiVanBan?: string;
  moTa?: string;
  suDung?: boolean;
}) => apiPut<{ id: number }>(`/api/documents/types/${id}`, payload);

export const deleteDocumentType = (id: number) =>
  apiDelete<{ id: number }>(`/api/documents/types/${id}`);
