import { apiDelete, apiGet, apiPost } from "../core/apiClient";

export type DocumentVersion = {
  versionName: string;
  fileUrl?: string;
  createdAt?: string;
};

export const createDocumentVersion = (documentId: number, payload: {
  versionName: string;
  noiDungThayDoi?: string;
  fileUrl?: string;
}) => apiPost<{ documentId: number }>(
  `/api/documents/${documentId}/versions`,
  payload
);

export const fetchDocumentVersions = (documentId: number) =>
  apiGet<DocumentVersion[]>(`/api/documents/${documentId}/versions`);

export const compareDocumentVersions = (documentId: number, params: {
  fromVersion: string;
  toVersion: string;
}) => apiGet<{ documentId: number; differences: Array<{ field: string; oldValue: string; newValue: string }> }>(
  `/api/documents/${documentId}/versions/compare`,
  { params }
);

export const restoreDocumentVersion = (documentId: number, versionName: string) =>
  apiPost<{ documentId: number }>(
    `/api/documents/${documentId}/versions/restore`,
    { versionName }
  );

export const deleteDocumentVersion = (documentId: number, versionName: string) =>
  apiDelete<{ documentId: number }>(
    `/api/documents/${documentId}/versions/${versionName}`
  );
