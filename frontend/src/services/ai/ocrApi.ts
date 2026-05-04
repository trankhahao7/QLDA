import { apiPost } from "../core/apiClient";

export const uploadOcrFile = (documentId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost<{ documentId: number; fileName: string; fileUrl: string }>(
    `/api/documents/${documentId}/ocr/upload`,
    formData
  );
};

export const processOcr = (documentId: number, payload: {
  fileUrl: string;
  language?: string;
}) => apiPost<{ documentId: number; ocrText: string; confidence: number }>(
  `/api/documents/${documentId}/ocr/process`,
  payload
);

export const saveOcrResult = (documentId: number, payload: {
  ocrText: string;
  confidence?: number;
}) => apiPost<{ documentId: number; daOCR: boolean }>(
  `/api/documents/${documentId}/ocr/save`,
  payload
);
