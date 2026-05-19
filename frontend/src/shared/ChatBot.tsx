import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { askChatbot } from "../services/ai/aiApi";
import type { ChatbotResponse, ChatbotSource } from "../services/ai/aiApi";
import { getCurrentUser } from "../services/auth/authApi";

type ChatDebugInfo = {
  intent: string;
  modelUsed: string;
  confidence: number;
  sourcesCount: number;
  durationMs: number;
};

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
  isError?: boolean;
  debugInfo?: ChatDebugInfo;
};

type ChatLogEntry = {
  timestamp: string;
  label: string;
  data?: unknown;
};

const DEBOUNCE_MS = 500;
const MIN_SEND_INTERVAL_MS = 1000;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    sender: "bot",
    text: "Xin chào, tôi là trợ lý AI của hệ thống. Bạn cần hỗ trợ gì?",
  },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [lastDebugInfo, setLastDebugInfo] = useState<ChatDebugInfo | null>(null);
  const [requestLogs, setRequestLogs] = useState<ChatLogEntry[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestInFlightRef = useRef(false);
  const debugPanelRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch current user on mount ──
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUserId(user.id);
        console.log(`%c[ChatBot] %cUser authenticated`, "color:#6c5ce7", "color:#00b894", { id: user.id, name: user.hoTen });
      })
      .catch(() => {
        console.warn(`%c[ChatBot] %cUser not authenticated`, "color:#6c5ce7", "color:#e17055");
      });
  }, []);

  // ── Detailed logger ────────────────────────────────────────────────────
  const addLog = useCallback((label: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString("vi-VN", { hour12: false });
    const entry: ChatLogEntry = { timestamp, label, data };
    setRequestLogs((prev) => [...prev.slice(-49), entry]);
    const style = label.startsWith("error") || label.startsWith("fail")
      ? "color:#d63031;font-weight:bold"
      : "color:#6c5ce7;font-weight:bold";
    console.debug(`%c[ChatBot]%c ${label}`, style, "color:inherit", data ?? "");
  }, []);

  // ── API call using aiApi ────────────────────────────────────────────────
  const callChatApi = useCallback(async (message: string): Promise<{ text: string; debug: ChatDebugInfo | null }> => {
    if (!userId) {
      return { text: "Vui lòng đăng nhập để sử dụng trợ lý AI.", debug: null };
    }

    const startedAt = performance.now();
    addLog(">> REQUEST", { userId, questionLength: message.length, questionPreview: message.slice(0, 60) });

    try {
      const data: ChatbotResponse = await askChatbot({ userId, question: message });

      const durationMs = Math.round(performance.now() - startedAt);

      const debug: ChatDebugInfo = {
        intent: data.intent || "unknown",
        modelUsed: data.modelUsed || "unknown",
        confidence: data.confidence ?? 0,
        sourcesCount: data.sources?.length ?? 0,
        durationMs,
      };

      addLog("<< RESPONSE OK", {
        durationMs: `${durationMs}ms`,
        intent: data.intent,
        model: data.modelUsed,
        confidence: data.confidence,
        sourcesCount: data.sources?.length,
        answerPreview: data.answer?.slice(0, 100),
      });

      if (data.sources && data.sources.length > 0) {
        data.sources.slice(0, 3).forEach((s: ChatbotSource, i: number) => {
          addLog(`  source[${i}]`, {
            docId: s.documentId,
            chunkId: s.chunkId,
            score: s.score?.toFixed(3),
            title: s.title,
            textPreview: s.matchedText?.slice(0, 80),
          });
        });
        if (data.sources.length > 3) {
          addLog(`  ... and ${data.sources.length - 3} more sources`);
        }
      }

      return { text: data.answer, debug };
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      addLog("<< ERROR", { error: String(error), durationMs: `${durationMs}ms` });
      return { text: "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.", debug: null };
    }
  }, [userId, addLog]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !userId || requestInFlightRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < MIN_SEND_INTERVAL_MS) return;
    lastSentRef.current = now;
    requestInFlightRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "bot", text: "..." }]);

    const { text, debug } = await callChatApi(trimmed);

    if (debug) {
      setLastDebugInfo(debug);
    }
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { sender: "bot", text, debugInfo: debug ?? undefined },
    ]);
    setIsLoading(false);
    requestInFlightRef.current = false;
  }, [input, isLoading, userId, callChatApi]);

  // ── Debounced submit handlers ───────────────────────────────────────────
  const handleInput = useCallback((value: string) => {
    setInput(value);
    debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(sendMessage, DEBOUNCE_MS);
  }, [sendMessage]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      debounceRef.current && clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(sendMessage, DEBOUNCE_MS);
    }
  }, [sendMessage]);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (showDebug && debugPanelRef.current) {
      debugPanelRef.current.scrollTop = debugPanelRef.current.scrollHeight;
    }
  }, [requestLogs, showDebug]);

  // ── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => () => {
    debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  // ── Button label ────────────────────────────────────────────────────────
  const sendButtonLabel = useMemo(() => {
    if (isLoading) return "...";
    return "Gửi";
  }, [isLoading]);

  const isSendDisabled = isLoading || !input.trim() || !userId;
  const canShowPanel = isOpen && !isMinimized;

  // ── Render ──────────────────────────────────────────────────────────────
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
            <p>Hỗ trợ thao tác nhanh trong hệ thống</p>
          </div>
        </div>
        <div className="chatbot__actions">
          <button
            type="button"
            className={`chatbot__icon-button chatbot__debug-btn${showDebug ? " chatbot__debug-btn--active" : ""}`}
            onClick={() => setShowDebug((prev) => !prev)}
            aria-label="Bật/tắt debug"
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
                  }`}
                >
                  {message.text}
                </div>
                {showDebug && message.debugInfo && (
                  <div className="chatbot__msg-debug">
                    <span>intent: {message.debugInfo.intent}</span>
                    <span>model: {message.debugInfo.modelUsed}</span>
                    <span>confidence: {(message.debugInfo.confidence * 100).toFixed(1)}%</span>
                    <span>sources: {message.debugInfo.sourcesCount}</span>
                    <span>duration: {message.debugInfo.durationMs}ms</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showDebug && (
            <div className="chatbot__debug-panel" ref={debugPanelRef}>
              <div className="chatbot__debug-title">
                DEBUG LOGS
                <button
                  type="button"
                  className="chatbot__debug-clear"
                  onClick={() => setRequestLogs([])}
                >
                  Xoá
                </button>
              </div>
              {requestLogs.length === 0 && (
                <div className="chatbot__debug-empty">Chưa có request nào</div>
              )}
              {requestLogs.map((entry, i) => (
                <div key={i} className="chatbot__debug-line">
                  <span className="chatbot__debug-time">{entry.timestamp}</span>
                  <span className={`chatbot__debug-label${
                    entry.label.startsWith("<< ERROR") ? " chatbot__debug-label--err" : ""
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
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!userId ? "Vui lòng đăng nhập..." : "Nhập câu hỏi của bạn..."}
              disabled={isLoading || !userId}
              aria-label="Nhập câu hỏi cho trợ lý AI"
            />
            <button
              type="submit"
              className="chatbot__send-button"
              disabled={isSendDisabled}
            >
              {sendButtonLabel}
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