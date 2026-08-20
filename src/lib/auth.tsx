import * as React from "react";

import { api } from "@/lib/api";

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  login: (passphrase: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthContextValue["status"]>("loading");

  React.useEffect(() => {
    api
      .session()
      .then((res) => setStatus(res.authenticated ? "authenticated" : "unauthenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  const login = React.useCallback(async (passphrase: string) => {
    await api.login(passphrase);
    setStatus("authenticated");
  }, []);

  const logout = React.useCallback(async () => {
    await api.logout();
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
