import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getSession, loginUser, normalizeEmail, setSession, signupUser } from "../lib/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = getSession();
    return s?.email ? { name: s.name, email: s.email } : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const result = loginUser(email, password);
    setLoading(false);
    if (result.ok) {
      setUser(result.user);
      setSession(result.user);
    }
    return result;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const result = signupUser({ name, email, password });
    setLoading(false);
    if (result.ok) {
      const u = { name: name.trim(), email: normalizeEmail(email) };
      setUser(u);
      setSession(u);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
