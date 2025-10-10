import clsx from "clsx";

type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  type: "text" | "voice";
  content: string;
  timestamp: string;
  audioUrl?: string | null;
};

type MessageBubbleProps = {
  message: ChatMessage;
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={clsx(
        "flex w-full flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={clsx(
          "max-w-full rounded-3xl border px-5 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%]",
          isUser
            ? "border-primary/60 bg-primary text-white"
            : "border-slate-200 bg-white text-slate-800"
        )}
      >
        {message.type === "voice" && message.audioUrl ? (
          <div className="flex flex-col gap-2">
            <span className={clsx("text-xs font-semibold", isUser ? "text-white/80" : "text-slate-500")}>
              Voice message
            </span>
            <audio controls src={message.audioUrl} className="w-full" />
            {message.content && (
              <p className={clsx("text-xs", isUser ? "text-white/80" : "text-slate-500")}>{message.content}</p>
            )}
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      <span className={clsx("text-xs", isUser ? "text-primary/70" : "text-slate-400")}>{message.timestamp}</span>
    </div>
  );
};

export type { ChatMessage };
export default MessageBubble;
