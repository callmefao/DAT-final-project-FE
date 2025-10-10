import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { useAuth } from "../../hooks/useAuth";
import { useErrorOverlay } from "../../hooks/useErrorOverlay";
import { getErrorMessage } from "../../utils/error";
import { sendTextMessage, sendVoiceMessage } from "../../api/chatApi";
import Sidebar, { type ChatSessionSummary } from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import type { ChatMessage } from "./components/MessageBubble";

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const generateId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}`;
};

const createSession = (title: string): ChatSession => {
  const timestamp = new Date().toISOString();
  return {
    id: generateId("session"),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: []
  };
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const formatSessionUpdatedAt = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  });
};

const VoiceChatPage = () => {
  const { user } = useAuth();
  const { showError } = useErrorOverlay();

  const initialSession = useMemo(() => createSession("Voice session 1"), []);
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSession.id);
  const sessionCounterRef = useRef(1);

  const [isSendingText, setIsSendingText] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const audioUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioUrlsRef.current = [];
    };
  }, []);

  const activeSession = useMemo(() => sessions.find((session) => session.id === activeSessionId) ?? null, [sessions, activeSessionId]);

  const sessionSummaries: ChatSessionSummary[] = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        title: session.title,
        updatedAt: formatSessionUpdatedAt(session.updatedAt)
      })),
    [sessions]
  );

  const ensureAuthenticated = () => {
    if (!user?.username) {
      showError("Vui lòng đăng nhập để trò chuyện với chatbot.");
      return false;
    }
    return true;
  };

  const updateSession = (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
    setSessions((previous) => {
      const updated: ChatSession[] = [];
      let nextSession: ChatSession | null = null;

      for (const session of previous) {
        if (session.id === sessionId) {
          const next = updater(session);
          nextSession = {
            ...next,
            updatedAt: new Date().toISOString()
          };
        } else {
          updated.push(session);
        }
      }

      if (!nextSession) {
        return previous;
      }

      return [nextSession, ...updated.filter((session) => session.id !== sessionId)];
    });
  };

  const appendMessage = (sessionId: string, message: ChatMessage) => {
    updateSession(sessionId, (session) => ({
      ...session,
      messages: [...session.messages, message]
    }));
  };

  const handleCreateSession = () => {
    sessionCounterRef.current += 1;
    const newSession = createSession(`Voice session ${sessionCounterRef.current}`);
    setSessions((previous) => [newSession, ...previous]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleSendText = async (text: string) => {
    if (!activeSession) {
      return;
    }
    const username = user?.username;
    if (!username) {
      ensureAuthenticated();
      return;
    }

    const timestamp = formatTime(new Date());
    const userMessage: ChatMessage = {
      id: generateId("message-user"),
      sender: "user",
      type: "text",
      content: text,
      timestamp
    };

    appendMessage(activeSession.id, userMessage);

    try {
      setIsSendingText(true);
      const response = await sendTextMessage(username, text);
      const botMessage: ChatMessage = {
        id: generateId("message-bot"),
        sender: "bot",
        type: "text",
        content: response.message,
        timestamp: formatTime(new Date())
      };
      appendMessage(activeSession.id, botMessage);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể gửi tin nhắn văn bản.");
      showError(message);
      appendMessage(activeSession.id, {
        id: generateId("message-system"),
        sender: "bot",
        type: "text",
        content: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.",
        timestamp: formatTime(new Date())
      });
    } finally {
      setIsSendingText(false);
    }
  };

  const handleSendVoice = async (file: File, meta?: { audioUrl?: string; duration: number }) => {
    if (!activeSession) {
      if (meta?.audioUrl) {
        URL.revokeObjectURL(meta.audioUrl);
      }
      return;
    }
    const username = user?.username;
    if (!username) {
      if (meta?.audioUrl) {
        URL.revokeObjectURL(meta.audioUrl);
      }
      ensureAuthenticated();
      return;
    }

    const timestamp = formatTime(new Date());

    if (meta?.audioUrl) {
      audioUrlsRef.current.push(meta.audioUrl);
    }

    const voiceMessage: ChatMessage = {
      id: generateId("message-user"),
      sender: "user",
      type: "voice",
      content: "Đã gửi tin nhắn thoại",
      timestamp,
      audioUrl: meta?.audioUrl
    };

    appendMessage(activeSession.id, voiceMessage);

    try {
      setIsSendingVoice(true);
      const response = await sendVoiceMessage(username, {
        file,
        duration: meta?.duration
      });

      const botMessage: ChatMessage = {
        id: generateId("message-bot"),
        sender: "bot",
        type: "text",
        content: response.message,
        timestamp: formatTime(new Date())
      };
      appendMessage(activeSession.id, botMessage);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể gửi tin nhắn thoại.");
      showError(message);
      appendMessage(activeSession.id, {
        id: generateId("message-system"),
        sender: "bot",
        type: "text",
        content: "Xin lỗi, tôi không thể nghe thấy bạn lúc này.",
        timestamp: formatTime(new Date())
      });
    } finally {
      setIsSendingVoice(false);
    }
  };

  const layoutClasses = clsx(
    "flex h-full flex-1 flex-col gap-6",
    "lg:flex-row"
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-8 text-slate-800 shadow-inner lg:p-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary lg:text-4xl">Voice Chat with Chatbot</h1>
          <p className="text-sm text-slate-600 lg:text-base">
            Giữ cuộc trò chuyện tự nhiên với chatbot bằng giọng nói hoặc văn bản. Lịch sử trò chuyện của bạn sẽ xuất hiện ở bên trái.
          </p>
        </div>
      </section>

      <div className={layoutClasses}>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div>
            <p className="text-sm font-semibold text-slate-800">Cuộc trò chuyện</p>
            <p className="text-xs text-slate-500">Nhấn để xem danh sách các đoạn hội thoại.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            onClick={() => setIsSidebarOpen((value) => !value)}
          >
            {isSidebarOpen ? "Đóng" : "Danh sách"}
          </button>
        </div>

        <div className="relative flex h-[70vh] flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <div className="hidden lg:block">
            <Sidebar
              sessions={sessionSummaries}
              activeSessionId={activeSessionId}
              onSelect={handleSelectSession}
              onCreate={handleCreateSession}
            />
          </div>

          {isSidebarOpen && (
            <div className="absolute inset-0 z-20 flex lg:hidden">
              <div className="h-full w-4/5 max-w-xs shadow-xl shadow-slate-800/20">
                <Sidebar
                  sessions={sessionSummaries}
                  activeSessionId={activeSessionId}
                  onSelect={handleSelectSession}
                  onCreate={handleCreateSession}
                  isVisible
                  onClose={() => setIsSidebarOpen(false)}
                />
              </div>
              <div className="flex-1 bg-slate-900/20" onClick={() => setIsSidebarOpen(false)} />
            </div>
          )}

          <ChatArea
            sessionTitle={activeSession?.title}
            messages={activeSession?.messages ?? []}
            onSendText={handleSendText}
            onSendVoice={handleSendVoice}
            isSendingText={isSendingText}
            isSendingVoice={isSendingVoice}
            isRecording={isRecording}
            onRecordingStateChange={setIsRecording}
            onComposerFocus={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceChatPage;
