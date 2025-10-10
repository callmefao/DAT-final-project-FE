import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import Button from "../../../components/Button";
import MessageBubble, { ChatMessage } from "./MessageBubble";
import VoiceRecorderButton from "./VoiceRecorderButton";

type ChatAreaProps = {
  sessionTitle?: string;
  messages: ChatMessage[];
  onSendText: (text: string) => Promise<void> | void;
  onSendVoice: (file: File, meta?: { audioUrl?: string; duration: number }) => Promise<void> | void;
  isSendingText?: boolean;
  isSendingVoice?: boolean;
  isRecording?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onComposerFocus?: () => void;
};

const ChatArea = ({
  sessionTitle,
  messages,
  onSendText,
  onSendVoice,
  isSendingText = false,
  isSendingVoice = false,
  isRecording = false,
  onRecordingStateChange,
  onComposerFocus
}: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const hasSession = Boolean(sessionTitle);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isRecording && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRecording]);

  const handleSubmitText = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tin nhắn.");
      return;
    }

    setError(null);
    await onSendText(trimmed);
    setInputValue("");
  };

  const placeholder = useMemo(
    () => "Nhập tin nhắn hoặc nhấn mic để nói…",
    []
  );

  return (
    <section className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{sessionTitle ?? "Chưa chọn đoạn chat"}</h1>
          <p className="text-xs text-slate-500">Trò chuyện với chatbot bằng giọng nói hoặc văn bản.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Conversation options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.25a.75.75 0 11-.001 1.501A.75.75 0 0112 5.25zm0 6.25a.75.75 0 11-.001 1.501A.75.75 0 0112 11.5zm0 6.25a.75.75 0 11-.001 1.501A.75.75 0 0112 17.75z" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-hidden bg-slate-50/60">
        <div ref={listRef} className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-6">
          {!hasSession ? (
            <div className="mt-20 flex flex-col items-center gap-3 text-center text-slate-500">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                </svg>
              </span>
              <p className="text-sm">Chọn một đoạn chat ở bên trái hoặc tạo đoạn mới.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="mt-20 flex flex-col items-center gap-3 text-center text-slate-500">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6V7.5a6 6 0 10-12 0V12a6 6 0 006 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2.25" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 22.5h7.5" />
                </svg>
              </span>
              <p className="text-sm">Hãy là người mở đầu cuộc trò chuyện.</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white/90 px-6 py-4 shadow-inner">
        <form onSubmit={handleSubmitText} className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                ref={inputRef}
                className="h-10 w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder={placeholder}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={1}
                onFocus={onComposerFocus}
                disabled={!hasSession || isSendingText || isSendingVoice || isRecording}
              />
            </div>

            <VoiceRecorderButton
              disabled={!hasSession || isSendingVoice || isSendingText}
              onRecordingComplete={(file, meta) => {
                if (file) {
                  onSendVoice(file, meta);
                }
              }}
              onRecordingStateChange={onRecordingStateChange}
              onError={(message) => setError(message)}
            />

            <Button
              type="submit"
              className={clsx("px-6", "shadow-sm")}
              disabled={!hasSession || !inputValue.trim() || isSendingText || isRecording}
              isLoading={isSendingText}
            >
              Gửi
            </Button>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{isRecording ? "Đang ghi âm…" : isSendingVoice ? "Đang gửi giọng nói…" : ""}</span>
            {!isRecording && durationCopy(messages)}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </footer>
    </section>
  );
};

const durationCopy = (messages: ChatMessage[]) => {
  if (!messages.length) return null;
  const lastMessage = messages[messages.length - 1];
  const senderLabel = lastMessage.sender === "user" ? "Bạn" : "Bot";
  return `${senderLabel} • ${lastMessage.timestamp}`;
};

export type { ChatAreaProps };
export default ChatArea;
