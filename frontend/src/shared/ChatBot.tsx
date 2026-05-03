import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ChatMessage = {
  sender: "bot" | "user";
  text: string;
  isError?: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const API_URL = "http://localhost:8086/api/chat";
const DEBOUNCE_MS = 500;        // chờ 500ms sau lần gõ cuối
const MIN_SEND_INTERVAL_MS = 1000; // tối thiểu 1s giữa 2 lần gửi
const DEBUG_CHAT = true;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    sender: "bot",
    text: "Xin chào, tôi là trợ lý AI của hệ thống. Bạn cần hỗ trợ gì?",
  },
];

// Session ID đơn giản để backend nhận dạng user
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0); // thời gian chờ từ backend

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<number>(0);      // timestamp lần gửi cuối
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestInFlightRef = useRef(false);

  const debugLog = useCallback((label: string, payload?: unknown) => {
    if (!DEBUG_CHAT) return;
    if (payload === undefined) {
      console.debug(`[ChatBot] ${label}`);
      return;
    }
    console.debug(`[ChatBot] ${label}`, payload);
  }, []);

  const canShowPanel = isOpen && !isMinimized;

  // ── Cooldown countdown ──────────────────────────────────────────────────
  const startCooldown = useCallback((ms: number) => {
    setCooldownMs(ms);
    cooldownRef.current && clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev <= 200) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 200;
      });
    }, 200);
  }, []);

  // ── API call ────────────────────────────────────────────────────────────
  const callChatApi = useCallback(async (message: string) => {
    const startedAt = performance.now();
    debugLog("request:start", {
      messageLength: message.length,
      sessionId: SESSION_ID,
    });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: SESSION_ID }),
      });

      const data = await res.json().catch(() => null);
      const durationMs = Math.round(performance.now() - startedAt);

      debugLog("request:response", {
        status: res.status,
        ok: res.ok,
        durationMs,
        success: data?.success,
        errorCode: data?.errorCode,
        retryAfterMs: data?.retryAfterMs,
      });

      if (!data.success) {
        // Xử lý rate limit từ backend
        if (data.errorCode === "RATE_LIMITED" && data.retryAfterMs) {
          startCooldown(data.retryAfterMs);
        }
        return data.reply ?? "Có lỗi xảy ra, vui lòng thử lại.";
      }

      return data.reply;
    } catch (error) {
      debugLog("request:error", error);
      return "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.";
    }
  }, [debugLog, startCooldown]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || cooldownMs > 0 || requestInFlightRef.current) return;

    // Chống double-send: kiểm tra khoảng cách thời gian
    const now = Date.now();
    if (now - lastSentRef.current < MIN_SEND_INTERVAL_MS) return;
    lastSentRef.current = now;
    requestInFlightRef.current = true;

    // Thêm message của user ngay lập tức
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    // Thêm typing indicator
    setMessages((prev) => [...prev, { sender: "bot", text: "...", isError: false }]);

    const reply = await callChatApi(trimmed);

    // Thay typing indicator bằng reply thật
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { sender: "bot", text: reply },
    ]);
    setIsLoading(false);
    requestInFlightRef.current = false;
  }, [input, isLoading, cooldownMs, callChatApi]);

  // ── Debounced submit handler ────────────────────────────────────────────
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

  // ── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => () => {
    debounceRef.current && clearTimeout(debounceRef.current);
    cooldownRef.current && clearInterval(cooldownRef.current);
  }, []);

  // ── Button label ────────────────────────────────────────────────────────
  const sendButtonLabel = useMemo(() => {
    if (isLoading) return "...";
    if (cooldownMs > 0) return `${Math.ceil(cooldownMs / 1000)}s`;
    return "Gửi";
  }, [isLoading, cooldownMs]);

  const isSendDisabled = isLoading || cooldownMs > 0 || !input.trim();

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
              <div
                key={`${message.sender}-${index}`}
                className={`chatbot__message chatbot__message--${message.sender}${
                  message.text === "..." ? " chatbot__message--typing" : ""
                }`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot__composer" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                cooldownMs > 0
                  ? `Chờ ${Math.ceil(cooldownMs / 1000)}s...`
                  : "Nhập câu hỏi của bạn..."
              }
              disabled={isLoading}
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