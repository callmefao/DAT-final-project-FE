import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import { AuthContext, AuthUser } from "./auth";
import { deleteCookie, getCookie, setCookie } from "../utils/cookie";

const COOKIE_NAME = "voice_auth_user";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (authUser: AuthUser) => {
    setUser(authUser);
    try {
      setCookie(COOKIE_NAME, JSON.stringify(authUser), { maxAge: 60 * 60 * 24 * 30 });
    } catch {
      // ignore cookie errors
    }
  };

  const logout = () => {
    setUser(null);
    deleteCookie(COOKIE_NAME);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      try {
        setCookie(COOKIE_NAME, JSON.stringify(next), { maxAge: 60 * 60 * 24 * 30 });
      } catch {
        // ignore cookie errors
      }
      return next;
    });
  };

  const value = useMemo(() => ({ user, login, logout, updateUser }), [user]);

  useEffect(() => {
    try {
      const raw = getCookie(COOKIE_NAME);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.username) {
        setUser(parsed);
      }
    } catch {
      deleteCookie(COOKIE_NAME);
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
