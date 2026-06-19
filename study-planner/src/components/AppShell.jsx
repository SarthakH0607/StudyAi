import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { DarkModeToggle } from "./DarkModeToggle.jsx";

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-violet-600/15 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
  }`;

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/55 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 text-left transition hover:opacity-90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-lg font-bold text-white shadow-lg shadow-purple-500/20">
                S
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">StudyAI</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive study engine</p>
              </div>
            </button>
            <nav className="flex flex-wrap items-center gap-1 border-l border-slate-200 pl-6 dark:border-white/10">
              <NavLink to="/dashboard" className={navClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/notes" className={navClass}>
                Notes Generator
              </NavLink>
              <NavLink to="/planner" className={navClass}>
                Study Planner
              </NavLink>
              <NavLink to="/doubt-solver" className={navClass}>
                Doubt Solver
              </NavLink>
              <NavLink to="/settings" className={navClass}>
                Settings
              </NavLink>
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-sm text-slate-600 md:block dark:text-slate-300">
              <span className="text-slate-400">Hi,</span> {user?.name}
            </p>
            <DarkModeToggle dark={dark} onToggle={toggle} />
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="page-transition mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
