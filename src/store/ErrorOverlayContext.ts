import { createContext, useContext } from "react";

export type ErrorOverlayContextValue = {
  showError: (message: string, duration?: number) => void;
  hideError: () => void;
};

export const ErrorOverlayContext = createContext<ErrorOverlayContextValue | undefined>(undefined);

export const useErrorOverlay = () => {
  const context = useContext(ErrorOverlayContext);

  if (!context) {
    throw new Error("useErrorOverlay must be used within an ErrorOverlayProvider");
  }

  return context;
};
