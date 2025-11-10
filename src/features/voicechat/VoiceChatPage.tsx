import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { useAuth } from "../../hooks/useAuth";
import { useErrorOverlay } from "../../hooks/useErrorOverlay";
import { getErrorMessage } from "../../utils/error";
import { 
  createChatSession,
  getChatSessions,
  getChatSessionDetail,
  sendTextMessage, 
  sendVoiceMessage,
  deleteChatSession
} from "../../api/chatApi";
import type { ChatMessageData } from "../../types/api";
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

/**
 * Convert API message data to UI message format
 */
const convertApiMessageToUiMessage = (apiMessage: ChatMessageData): ChatMessage => {
  const timestamp = formatTime(new Date(apiMessage.time));
  return {
    id: generateId("message"),
    sender: apiMessage.role === "human" ? "user" : "bot",
    type: "text",
    content: apiMessage.message,
    timestamp
  };
};

const VoiceChatPage = () => {
  const { user } = useAuth();
  const { showError } = useErrorOverlay();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
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

  // Load all sessions when user is authenticated
  useEffect(() => {
    const loadSessions = async () => {
      if (!user?.username) {
        return;
      }

      try {
        const sessionIds = await getChatSessions(user.username);
        
        // Load details for each session
        const sessionDetails = await Promise.all(
          sessionIds.map(async (sessionId) => {
            try {
              const detail = await getChatSessionDetail(user.username!, sessionId);
              return {
                id: detail.session_id,
                title: detail.session_name,
                createdAt: detail.created_at,
                updatedAt: detail.created_at, // Use created_at as updatedAt initially
                messages: detail.messages.map(convertApiMessageToUiMessage)
              };
            } catch {
              // If a session fails to load, skip it
              return null;
            }
          })
        );

        // Filter out null values and sort by created date (newest first)
        const validSessions = sessionDetails
          .filter((session): session is ChatSession => session !== null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setSessions(validSessions);
        
        // Set first session as active if available
        if (validSessions.length > 0 && !activeSessionId) {
          setActiveSessionId(validSessions[0].id);
        }
        
        sessionCounterRef.current = validSessions.length;
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải danh sách phiên chat.");
        showError(message);
      }
    };

    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]); // Only reload when username changes

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

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

  const handleCreateSession = async () => {
    if (!user?.username) {
      ensureAuthenticated();
      return;
    }

    try {
      sessionCounterRef.current += 1;
      const sessionName = `Voice session ${sessionCounterRef.current}`;
      
      // Create session via API
      const { session_id } = await createChatSession(user.username, sessionName);
      
      // Add to local state
      const newSession: ChatSession = {
        id: session_id,
        title: sessionName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      
      setSessions((previous) => [newSession, ...previous]);
      setActiveSessionId(session_id);
      setIsSidebarOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tạo phiên chat mới.");
      showError(message);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    // If session is already in local state, just switch to it
    const existingSession = sessions.find((s) => s.id === sessionId);
    if (existingSession) {
      setActiveSessionId(sessionId);
      setIsSidebarOpen(false);
      return;
    }

    // Otherwise, load it from API
    if (!user?.username) {
      ensureAuthenticated();
      return;
    }

    try {
      const detail = await getChatSessionDetail(user.username, sessionId);
      const session: ChatSession = {
        id: detail.session_id,
        title: detail.session_name,
        createdAt: detail.created_at,
        updatedAt: detail.created_at,
        messages: detail.messages.map(convertApiMessageToUiMessage)
      };
      
      setSessions((previous) => [session, ...previous]);
      setActiveSessionId(sessionId);
      setIsSidebarOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải phiên chat.");
      showError(message);
    }
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
      const response = await sendTextMessage(username, activeSession.id, text);
      const botMessage: ChatMessage = {
        id: generateId("message-bot"),
        sender: "bot",
        type: "text",
        content: response.reply,
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
      const response = await sendVoiceMessage(username, activeSession.id, file);

      // Show transcription if available and not empty
      const transcript = response.transcript?.trim();
      
      // Check if transcript is valid (not empty and not placeholder)
      if (transcript && 
          transcript.length > 0 && 
          transcript !== '(no transcription)' &&
          transcript !== 'no transcription') {
        const transcriptMessage: ChatMessage = {
          id: generateId("message-transcript"),
          sender: "user",
          type: "text",
          content: `[Transcription] ${transcript}`,
          timestamp: formatTime(new Date())
        };
        appendMessage(activeSession.id, transcriptMessage);
      }

      // Show bot reply
      const reply = response.reply?.trim();
      
      // Check if reply is valid (not empty and not placeholder)
      if (!reply || 
          reply.length === 0 || 
          reply === '(no reply)' ||
          reply === 'no reply') {
        const botMessage: ChatMessage = {
          id: generateId("message-bot"),
          sender: "bot",
          type: "text",
          content: "⚠️ Không thể chuyển đổi giọng nói của bạn. Có thể do:\n• File audio không được hỗ trợ (thử định dạng khác)\n• Dịch vụ transcription đang bận\n• Kết nối với n8n bị gián đoạn\n\nVui lòng thử lại hoặc sử dụng tin nhắn văn bản.",
          timestamp: formatTime(new Date())
        };
        appendMessage(activeSession.id, botMessage);
      } else {
        const botMessage: ChatMessage = {
          id: generateId("message-bot"),
          sender: "bot",
          type: "text",
          content: reply,
          timestamp: formatTime(new Date())
        };
        appendMessage(activeSession.id, botMessage);
      }
    } catch (error) {
      console.error('Voice message error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response: (error as any)?.response?.data
      });
      const message = getErrorMessage(error, "Không thể gửi tin nhắn thoại.");
      showError(message);
      appendMessage(activeSession.id, {
        id: generateId("message-system"),
        sender: "bot",
        type: "text",
        content: "Xin lỗi, đã có lỗi xảy ra khi gửi tin nhắn thoại. Vui lòng thử lại.",
        timestamp: formatTime(new Date())
      });
    } finally {
      setIsSendingVoice(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?.username) {
      ensureAuthenticated();
      return;
    }

    try {
      // Call API to delete session
      await deleteChatSession(user.username, sessionId);
      
      // Remove from local state
      setSessions((previous) => previous.filter((session) => session.id !== sessionId));
      
      // If deleted session was active, switch to first available session or null
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter((session) => session.id !== sessionId);
        setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Không thể xóa phiên chat.");
      showError(message);
    }
  };

  const layoutClasses = clsx(
    "flex h-full flex-1 flex-col gap-6",
    "lg:flex-row"
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-8 text-slate-800 shadow-inner lg:p-10">
        <div className="flex flex-col items-center text-center gap-2">
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
              onDelete={handleDeleteSession}
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
                  onDelete={handleDeleteSession}
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
