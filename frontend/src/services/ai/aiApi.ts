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
  soKyHieu?: string;
  reference?: string;
};

export type ConversationMessage = {
  role: "user" | "bot";
  content: string;
};

export type DocumentResult = {
  documentId: number;
  title?: string;
  soKyHieu?: string;
};

export type StatCardData = {
  metricCode: string;
  metricLabel: string;
  value: number;
};

export type GuideStepsData = {
  steps: string[];
};

export type ChatbotStructuredData = {
  // DOCUMENT_LIST
  documents?: DocumentResult[];
  // STAT_CARD
  metricCode?: string;
  metricLabel?: string;
  value?: number;
  // GUIDE_STEPS
  steps?: string[];
};

export type ChatbotResponseType = "TEXT" | "DOCUMENT_LIST" | "STAT_CARD" | "GUIDE_STEPS";

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
  responseType?: ChatbotResponseType;
  structuredData?: ChatbotStructuredData;
};

export const askChatbot = (payload: {
  userId: number;
  question: string;
  context?: { module?: string; documentId?: number | null };
  conversationHistory?: ConversationMessage[];
  currentModule?: string;
}) => apiPost<ChatbotResponse>("/api/ai/chatbot/ask", payload);

export const feedbackChatbot = (payload: {
  resultId: number;
  feedback: "UP" | "DOWN";
  comment?: string;
}) => apiPost<{ resultId: number; feedback: string; recorded: boolean }>(
  "/api/ai/chatbot/feedback",
  payload
);

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
