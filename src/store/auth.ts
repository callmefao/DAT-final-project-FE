import { createContext } from "react";

export type AuthUser = {
  username: string;
  hasVoiceProfile?: boolean;
};

export type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
