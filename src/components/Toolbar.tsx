import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
    isActive ? "bg-primary text-white shadow" : "text-slate-600 hover:bg-primary/10 hover:text-primary"
  }`;

const Toolbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-lg font-semibold text-primary">
          VoiceAuth
        </NavLink>

        <div className="ml-auto flex items-center gap-6">
          <nav className="flex items-center gap-2">
            <NavLink to="/voice-chat" className={linkClass}>
              Voice Chat
            </NavLink>
          </nav>

          {!user && (
            <div className="flex items-center gap-3">
              <NavLink
                to="/register"
                className="rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Register
              </NavLink>
              <NavLink
                to="/login"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary/90"
              >
                Login
              </NavLink>
            </div>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <span>{user.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.061l-4.24 4.24a.75.75 0 01-1.06 0l-4.24-4.24a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <NavLink
                    to="/settings"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </NavLink>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
