import { apiGet, apiPost, apiDelete } from "../core/apiClient";

export type ClassifyResponse = {
  documentId: number;
  phanLoai: string;
  tenPhanLoai?: string;
  confidence: number;
  lyDo?: string;
  modelUsed?: string;
};

export type ChatbotSource = {
  documentId: number;
  chunkId: number;
  score: number;
  matchedText: string;
  title?: string;
  reference?: string;
};

export type ChatbotResponse = {
  resultId: number;
  intent: string;
  metricCode?: string;
  question: string;
  answer: string;
  value?: number;
  sources?: ChatbotSource[];
  modelUsed: string;
  confidence: number;
};

export const askChatbot = (payload: {
  userId: number;
  question: string;
  context?: {
    module?: string;
    documentId?: number | null;
  };
}) => apiPost<ChatbotResponse>("/api/ai/chatbot/ask", payload);

export const fetchConversation = (conversationId: string) =>
  apiGet<{ conversationId: string; messages: Array<{ role: string; content: string; createdAt: string }> }>(
    `/api/ai/chatbot/conversations/${conversationId}`
  );

export const deleteConversation = (conversationId: string) =>
  apiDelete<{ conversationId: string }>(`/api/ai/chatbot/conversations/${conversationId}`);

export const classifyDocument = (payload: {
  documentId: number;
  text: string;
  categories?: string[];
  language?: string;
}) => apiPost<ClassifyResponse>("/api/ai/classify", payload);
