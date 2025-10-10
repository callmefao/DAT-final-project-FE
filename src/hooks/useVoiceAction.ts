import { useCallback, useState } from "react";

import { getErrorMessage } from "../utils/error";
import { useErrorOverlay } from "./useErrorOverlay";

type VoiceActionHandler<T> = (username: string, file: File) => Promise<T>;

type VoiceActionState<T> = {
  result: T | null;
  isLoading: boolean;
  error: string | null;
  submit: (username: string, file: File | null) => Promise<boolean>;
  reset: () => void;
};

export const useVoiceAction = <T,>(handler: VoiceActionHandler<T>): VoiceActionState<T> => {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useErrorOverlay();

  const submit = useCallback(
    async (username: string, file: File | null) => {
      if (!username || !file) {
        const message = "Please provide both username and voice recording";
        setError(message);
        showError(message);
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await handler(username.trim(), file);
        setResult(response);
        return true;
      } catch (error) {
        const message = getErrorMessage(error);
        setResult(null);
        setError(message);
        showError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handler, showError]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, submit, reset };
};
