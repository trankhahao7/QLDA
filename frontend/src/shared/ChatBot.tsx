import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  askChatbot,
  feedbackChatbot,
} from "../services/ai/aiApi";
import type {
  ChatbotResponse,
  ChatbotStructuredData,
  ChatbotResponseType,
  ConversationMessage,
} from "../services/ai/aiApi";
import { getCurrentUser } from "../services/auth/authApi";

// ── Types ────────────────────────────────────────────────────────────────────

type FeedbackState = "UP" | "DOWN" | null;

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
  isError?: boolean;
  resultId?: number;
  responseType?: ChatbotResponseType;
  structuredData?: ChatbotStructuredData;
  sources?: Array<{ documentId: number; title?: string; soKyHieu?: string }>;
  feedback?: FeedbackState;
  intent?: string;
  modelUsed?: string;
  confidence?: number;
  durationMs?: number;
};

type ChatLogEntry = {
  timestamp: string;
  label: string;
  data?: unknown;
};

// ── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 400;
const MIN_SEND_INTERVAL_MS = 800;
const MAX_HISTORY = 5;

const SUGGESTED_QUESTIONS = [
  "Tôi có bao nhiêu văn bản chờ xử lý?",
  "Tìm cho tôi văn bản về ngân sách",
  "Làm sao để phê duyệt văn bản?",
  "Hệ thống có bao nhiêu văn bản tháng này?",
  "Cách tải lên văn bản mới?",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function DocumentListCard({ docs, onNavigate }: {
  docs: Array<{ documentId: number; title?: string; soKyHieu?: string }>;
  onNavigate: (id: number) => void;
}) {
  if (!docs.length) return null;
  return (
    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
      {docs.map((doc) => (
        <button
          key={doc.documentId}
          type="button"
          onClick={() => onNavigate(doc.documentId)}
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 6,
            padding: "5px 10px",
            textAlign: "left",
            cursor: "pointer",
            fontSize: 12,
            color: "#1d4ed8",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {doc.soKyHieu && <span style={{ fontFamily: "monospace", marginRight: 6 }}>{doc.soKyHieu}</span>}
          {doc.title || `Văn bản #${doc.documentId}`}
          <span style={{ marginLeft: 4, opacity: 0.6 }}>→</span>
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
      padding: "8px 16px", marginTop: 6, minWidth: 100,
    }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: "#16a34a", lineHeight: 1.2 }}>{value}</span>
      <span style={{ fontSize: 11, color: "#166534", marginTop: 2 }}>{label}</span>
    </div>
  );
}

function GuideSteps({ steps }: { steps: string[] }) {
  return (
    <ol style={{ margin: "6px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
      {steps.map((step, i) => (
        <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: "#1f2937" }}>
          {step.replace(/^(Bước \d+:|Step \d+:|\d+\.|\d+\))\s*/i, "")}
        </li>
      ))}
    </ol>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function moduleFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts.slice(0, 2).join("/") || "home";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatBot() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Xin chào! Tôi là trợ lý AI của hệ thống QLDA. Tôi có thể giúp bạn:" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [requestLogs, setRequestLogs] = useState<ChatLogEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Conversation history for multi-turn context
  const conversationHistory = useRef<ConversationMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestInFlightRef = useRef(false);
  const debugPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUserId(user.id))
      .catch(() => {});
  }, []);

  const addLog = useCallback((label: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString("vi-VN", { hour12: false });
    setRequestLogs((prev) => [...prev.slice(-49), { timestamp, label, data }]);
  }, []);

  const handleNavigateToDocument = useCallback((documentId: number) => {
    navigate(`/document/${documentId}`);
    setIsOpen(false);
  }, [navigate]);

  const handleFeedback = useCallback(async (msgIdx: number, feedback: "UP" | "DOWN") => {
    const msg = messages[msgIdx];
    if (!msg?.resultId) return;
    setMessages((prev) =>
      prev.map((m, i) => i === msgIdx ? { ...m, feedback } : m)
    );
    try {
      await feedbackChatbot({ resultId: msg.resultId, feedback });
    } catch {
      // silently ignore — feedback is best-effort
    }
  }, [messages]);

  const callChatApi = useCallback(async (message: string): Promise<Partial<ChatMessage>> => {
    if (!userId) {
      return { text: "Vui lòng đăng nhập để sử dụng trợ lý AI.", isError: true };
    }

    const startedAt = performance.now();
    const currentModule = moduleFromPath(location.pathname);
    addLog(">> REQUEST", { userId, module: currentModule, q: message.slice(0, 60) });

    try {
      const data: ChatbotResponse = await askChatbot({
        userId,
        question: message,
        currentModule,
        conversationHistory: conversationHistory.current.slice(-MAX_HISTORY),
      });

      const durationMs = Math.round(performance.now() - startedAt);
      addLog("<< OK", {
        ms: durationMs,
        intent: data.intent,
        responseType: data.responseType,
        model: data.modelUsed,
        sources: data.sources?.length,
      });

      // Update conversation history
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: "user", content: message },
        { role: "bot", content: data.answer },
      ].slice(-MAX_HISTORY * 2);

      const sources = data.sources?.map((s) => ({
        documentId: s.documentId,
        title: s.title,
        soKyHieu: s.soKyHieu,
      })) ?? [];

      return {
        text: data.answer,
        resultId: data.resultId,
        responseType: data.responseType,
        structuredData: data.structuredData,
        sources,
        intent: data.intent,
        modelUsed: data.modelUsed,
        confidence: data.confidence,
        durationMs,
      };
    } catch {
      const durationMs = Math.round(performance.now() - startedAt);
      addLog("<< ERROR", { ms: durationMs });
      return {
        text: "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.",
        isError: true,
      };
    }
  }, [userId, location.pathname, addLog]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const trimmed = (messageText ?? input).trim();
    if (!trimmed || isLoading || !userId || requestInFlightRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < MIN_SEND_INTERVAL_MS) return;
    lastSentRef.current = now;
    requestInFlightRef.current = true;
    setShowSuggestions(false);

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "bot", text: "..." }]);

    const result = await callChatApi(trimmed);

    setMessages((prev) => [
      ...prev.slice(0, -1),
      { sender: "bot", ...result } as ChatMessage,
    ]);
    setIsLoading(false);
    requestInFlightRef.current = false;
  }, [input, isLoading, userId, callChatApi]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendMessage(), DEBOUNCE_MS);
  }, [sendMessage]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      debounceRef.current && clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => sendMessage(), DEBOUNCE_MS);
    }
  }, [sendMessage]);

  const handleSuggestion = useCallback((q: string) => {
    sendMessage(q);
  }, [sendMessage]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (showDebug && debugPanelRef.current) {
      debugPanelRef.current.scrollTop = debugPanelRef.current.scrollHeight;
    }
  }, [requestLogs, showDebug]);

  useEffect(() => () => { debounceRef.current && clearTimeout(debounceRef.current); }, []);

  const isSendDisabled = isLoading || !input.trim() || !userId;
  const canShowPanel = isOpen && !isMinimized;

  // ── FAB ──
  if (!isOpen) {
    return (
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Mở trợ lý AI"
      >
        <span className="chatbot-fab__icon">AI</span>
        <span className="chatbot-fab__label">Trợ lý AI</span>
      </button>
    );
  }

  return (
    <section className={`chatbot ${isMinimized ? "chatbot--minimized" : ""}`}>
      <header className="chatbot__header">
        <div className="chatbot__title">
          <span className="chatbot__badge">AI</span>
          <div>
            <strong>{isMinimized ? "AI" : "Trợ lý AI"}</strong>
            {!isMinimized && <p>Tìm tài liệu · Số liệu · Hướng dẫn</p>}
          </div>
        </div>
        <div className="chatbot__actions">
          <button
            type="button"
            className={`chatbot__icon-button chatbot__debug-btn${showDebug ? " chatbot__debug-btn--active" : ""}`}
            onClick={() => setShowDebug((prev) => !prev)}
            title="Debug"
          >
            D
          </button>
          <button
            type="button"
            className="chatbot__icon-button"
            onClick={() => setIsMinimized((prev) => !prev)}
            aria-label={isMinimized ? "Phóng to" : "Thu nhỏ"}
          >
            {isMinimized ? "▢" : "—"}
          </button>
          <button
            type="button"
            className="chatbot__icon-button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      </header>

      {canShowPanel && (
        <>
          <div className="chatbot__messages" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`}>
                <div
                  className={`chatbot__message chatbot__message--${message.sender}${
                    message.text === "..." ? " chatbot__message--typing" : ""
                  }${message.isError ? " chatbot__message--error" : ""}`}
                >
                  {/* Welcome message suggestions */}
                  {index === 0 && showSuggestions && (
                    <div style={{ marginBottom: 8 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, opacity: 0.85 }}>
                        {message.text}
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                        {SUGGESTED_QUESTIONS.map((q) => (
                          <li key={q}>
                            <button
                              type="button"
                              onClick={() => handleSuggestion(q)}
                              disabled={isLoading || !userId}
                              style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: 6,
                                padding: "4px 10px",
                                color: "inherit",
                                fontSize: 12,
                                cursor: "pointer",
                                textAlign: "left",
                                width: "100%",
                              }}
                            >
                              {q}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Normal message text (skip for index 0 since we render it above) */}
                  {index !== 0 && message.text !== "..." && (
                    <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {message.text}
                    </span>
                  )}
                  {message.text === "..." && (
                    <span className="chatbot__typing-dots">···</span>
                  )}

                  {/* Rich structured data */}
                  {message.sender === "bot" && message.responseType === "DOCUMENT_LIST" &&
                    message.structuredData?.documents && message.structuredData.documents.length > 0 && (
                    <DocumentListCard
                      docs={message.structuredData.documents}
                      onNavigate={handleNavigateToDocument}
                    />
                  )}

                  {message.sender === "bot" && message.responseType === "STAT_CARD" &&
                    message.structuredData?.value !== undefined && (
                    <StatCard
                      label={message.structuredData.metricLabel ?? "Số liệu"}
                      value={message.structuredData.value}
                    />
                  )}

                  {message.sender === "bot" && message.responseType === "GUIDE_STEPS" &&
                    message.structuredData?.steps && message.structuredData.steps.length > 0 && (
                    <GuideSteps steps={message.structuredData.steps} />
                  )}
                </div>

                {/* Feedback buttons for bot messages */}
                {message.sender === "bot" && message.resultId && message.text !== "..." && (
                  <div className="chatbot__feedback-row">
                    <button
                      type="button"
                      className={`chatbot__feedback-btn${message.feedback === "UP" ? " active" : ""}`}
                      onClick={() => handleFeedback(index, "UP")}
                      title="Câu trả lời hữu ích"
                      disabled={message.feedback !== null && message.feedback !== undefined}
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      className={`chatbot__feedback-btn${message.feedback === "DOWN" ? " active" : ""}`}
                      onClick={() => handleFeedback(index, "DOWN")}
                      title="Câu trả lời chưa hữu ích"
                      disabled={message.feedback !== null && message.feedback !== undefined}
                    >
                      👎
                    </button>
                    {showDebug && message.intent && (
                      <span className="chatbot__msg-debug-inline">
                        {message.intent} · {message.modelUsed} · {message.durationMs}ms
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showDebug && (
            <div className="chatbot__debug-panel" ref={debugPanelRef}>
              <div className="chatbot__debug-title">
                DEBUG
                <button
                  type="button"
                  className="chatbot__debug-clear"
                  onClick={() => setRequestLogs([])}
                >
                  Xoá
                </button>
              </div>
              {requestLogs.length === 0 && (
                <div className="chatbot__debug-empty">Chưa có request</div>
              )}
              {requestLogs.map((entry, i) => (
                <div key={i} className="chatbot__debug-line">
                  <span className="chatbot__debug-time">{entry.timestamp}</span>
                  <span className={`chatbot__debug-label${
                    entry.label.startsWith("<< E") ? " chatbot__debug-label--err" : ""
                  }`}>{entry.label}</span>
                  {entry.data !== undefined && (
                    <span className="chatbot__debug-data">{JSON.stringify(entry.data)}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <form className="chatbot__composer" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!userId ? "Vui lòng đăng nhập..." : "Hỏi tôi bất cứ điều gì..."}
              disabled={isLoading || !userId}
              aria-label="Nhập câu hỏi cho trợ lý AI"
            />
            <button
              type="submit"
              className="chatbot__send-button"
              disabled={isSendDisabled}
            >
              {isLoading ? "..." : "Gửi"}
            </button>
          </form>
        </>
      )}

      {isMinimized && (
        <button
          type="button"
          className="chatbot__mini-hint"
          onClick={() => setIsMinimized(false)}
        >
          Nhấn để mở rộng
        </button>
      )}
    </section>
  );
}
