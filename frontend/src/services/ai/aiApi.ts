import { apiGet, apiPost, apiDelete } from "../core/apiClient";

export type ChatbotResponse = {
  conversationId: string;
  question: string;
  answer: string;
  sources?: Array<{ title: string; reference: string }>;
};

export const askChatbot = (payload: {
  userId: number;
  question: string;
  conversationId: string;
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
