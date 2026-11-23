import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/axios";
import { clearToken, getToken, saveToken } from "../api/token";
import type { LoginResponse, User } from "../types";
import { AuthContext, type AuthContextValue } from "./auth-context";

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null);

  useEffect(() => {
    if (getToken() === null) return;

    let ativo = true;
    api
      .get<User>("/users/me")
      .then((resposta) => {
        if (ativo) setUser(resposta.data);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const resposta = await api.post<LoginResponse>("/auth/login", { email, password });
    saveToken(resposta.data.token);
    setUser(resposta.data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, updateUser: setUser }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
