import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTodayIndex } from "../lib/constants.js";
import { defaultUserData, loadUserData, saveUserData } from "../lib/storage.js";
import { useAuth } from "./AuthContext.jsx";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email;

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!email) {
      setData(null);
      return;
    }
    const loaded = loadUserData(email);
    if (loaded) {
      setData(loaded);
    } else {
      const fresh = defaultUserData();
      setData(fresh);
      saveUserData(email, fresh);
    }
  }, [email]);

  useEffect(() => {
    if (!email || !data) return;
    saveUserData(email, data);
  }, [email, data]);

  const setTasks = useCallback((updater) => {
    setData((d) => {
      if (!d) return d;
      const nextTasks = typeof updater === "function" ? updater(d.tasks) : updater;
      return { ...d, tasks: nextTasks };
    });
  }, []);

  const setSuggestionIndex = useCallback((updater) => {
    setData((d) => {
      if (!d) return d;
      const v = typeof updater === "function" ? updater(d.suggestionIndex) : updater;
      return { ...d, suggestionIndex: v };
    });
  }, []);

  const setWeeklyFocus = useCallback((updater) => {
    setData((d) => {
      if (!d) return d;
      const next = typeof updater === "function" ? updater(d.weeklyFocus) : updater;
      return { ...d, weeklyFocus: next };
    });
  }, []);

  const bumpWeeklyFocusHours = useCallback((hours) => {
    setData((d) => {
      if (!d) return d;
      const next = [...d.weeklyFocus];
      const idx = getTodayIndex();
      next[idx] = Math.min(12, Math.round((next[idx] + hours) * 10) / 10);
      return { ...d, weeklyFocus: next };
    });
  }, []);

  const value = useMemo(() => {
    const tasks = data?.tasks ?? [];
    const streak = data?.streak ?? 1;
    const suggestionIndex = data?.suggestionIndex ?? 0;
    const weeklyFocus = data?.weeklyFocus ?? defaultUserData().weeklyFocus;

    return {
      tasks,
      setTasks,
      streak,
      suggestionIndex,
      setSuggestionIndex,
      weeklyFocus,
      setWeeklyFocus,
      bumpWeeklyFocusHours,
      hydrated: Boolean(email && data),
      raw: data,
    };
  }, [data, email, setTasks, setSuggestionIndex, setWeeklyFocus, bumpWeeklyFocusHours]);

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}
