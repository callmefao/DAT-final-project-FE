import clsx from "clsx";

type ChatSessionSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

type SidebarProps = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onCreate: () => void;
  isVisible?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ sessions, activeSessionId, onSelect, onCreate, isVisible = true, onClose }: SidebarProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <aside className="flex h-full w-72 flex-col gap-4 border-r border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur lg:w-80">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Conversations</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close conversations panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
        New Chat
      </button>

      <nav className="flex-1 overflow-y-auto pr-1">
        {sessions.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">No conversations yet. Start a new chat to begin.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5",
                    activeSessionId === session.id ? "border-primary/40 bg-primary/10 text-primary" : "text-slate-700"
                  )}
                  onClick={() => onSelect(session.id)}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9a3 3 0 016 0v1.5a3 3 0 11-6 0V9z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v1.5" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12a7 7 0 1014 0v-.75M12 18v1.5"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{session.title}</span>
                    <span className="text-xs text-slate-500">{session.updatedAt}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export type { ChatSessionSummary };
export default Sidebar;
