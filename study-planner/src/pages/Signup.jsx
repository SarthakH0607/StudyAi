import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { DarkModeToggle } from "../components/DarkModeToggle.jsx";

export default function Signup() {
  const { signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const result = await signup(name, email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    window.setTimeout(() => navigate("/dashboard", { replace: true }), 400);
  };

  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link to="/login" className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400">
            Already have an account?
          </Link>
          <DarkModeToggle dark={dark} onToggle={toggle} />
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white shadow-lg">
              S
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Your tasks and streak stay private on this device.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                placeholder="Alex Student"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300" role="status">
                Account created — redirecting…
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  Creating account…
                </>
              ) : (
                "Sign up"
              )}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
