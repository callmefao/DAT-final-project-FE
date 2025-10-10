import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ErrorOverlayContext, type ErrorOverlayContextValue } from "./ErrorOverlayContext";

const AUTO_DISMISS_MS = 4000;

type ErrorOverlayProviderProps = {
  children: ReactNode;
  defaultDuration?: number;
};

const ErrorOverlayProvider = ({ children, defaultDuration = AUTO_DISMISS_MS }: ErrorOverlayProviderProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideError = useCallback(() => {
    clearTimer();
    setMessage(null);
  }, [clearTimer]);

  const showError = useCallback(
    (newMessage: string, duration?: number) => {
      clearTimer();
      setMessage(newMessage);
      const timeout = setTimeout(() => {
        setMessage(null);
        timeoutRef.current = null;
      }, duration ?? defaultDuration);
      timeoutRef.current = timeout;
    },
    [clearTimer, defaultDuration]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const value = useMemo<ErrorOverlayContextValue>(
    () => ({
      showError,
      hideError,
    }),
    [hideError, showError]
  );

  return (
    <ErrorOverlayContext.Provider value={value}>
      {children}
      <ErrorOverlay message={message} />
    </ErrorOverlayContext.Provider>
  );
};

const ErrorOverlay = ({ message }: { message: string | null }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
      <div className="pointer-events-auto max-w-md scale-100 transform rounded-2xl border border-red-200 bg-white/95 px-6 py-4 text-center text-sm text-red-700 shadow-2xl shadow-red-200 transition-all">
        {message}
      </div>
    </div>
  );
};

export default ErrorOverlayProvider;
