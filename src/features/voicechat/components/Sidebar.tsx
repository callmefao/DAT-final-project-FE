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
  onDelete?: (sessionId: string) => void;
  isVisible?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ sessions, activeSessionId, onSelect, onCreate, onDelete, isVisible = true, onClose }: SidebarProps) => {
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
                <div
                  className={clsx(
                    "group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5",
                    activeSessionId === session.id ? "border-primary/40 bg-primary/10 text-primary" : "text-slate-700"
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3"
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
                  {onDelete && (
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Bạn có chắc muốn xóa phiên chat "${session.title}"?`)) {
                          onDelete(session.id);
                        }
                      }}
                      aria-label="Delete conversation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
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
