import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUserData } from "../context/UserDataContext.jsx";
import { getTodayIndex } from "../lib/constants.js";
import { IllustrationProductivity } from "../components/Illustrations.jsx";

export default function Dashboard() {
  const { tasks, streak, weeklyFocus, hydrated } = useUserData();
  const [streakInfoOpen, setStreakInfoOpen] = useState(false);

  const todayIndex = getTodayIndex();
  const todayTasks = useMemo(() => tasks.filter((t) => t.dayIndex === todayIndex), [tasks, todayIndex]);

  const completedToday = todayTasks.filter((t) => t.progress >= 100).length;
  const avgProgress =
    tasks.length === 0 ? 0 : tasks.reduce((a, t) => a + t.progress, 0) / tasks.length;
  const focusScore = Math.max(
    0,
    Math.min(100, Math.round(52 + avgProgress * 0.38 - tasks.filter((t) => t.missed).length * 9))
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Your overview for today — open the planner for tasks and focus sessions, or analytics for trends.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setStreakInfoOpen(true)}
          className="glass-card rounded-2xl p-5 text-left transition hover:scale-[1.01] active:scale-[0.99]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-300">Streak</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{streak} days</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tap for how streaks work</p>
        </button>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Focus score</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{focusScore}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Derived from your task progress</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Today&apos;s progress</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
            {completedToday}/{todayTasks.length || 1}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tasks completed today</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Focus (today)</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
            {weeklyFocus[todayIndex]?.toFixed(1) ?? "—"}h
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Logged from completed sessions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          to="/planner"
          className="group glass-card flex flex-col justify-between rounded-2xl p-6 transition hover:border-violet-400/50"
        >
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Open planner</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Today&apos;s queue, smart calendar, and focus monitor — drag tasks between days and start timed focus blocks.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-violet-600 group-hover:translate-x-0.5 dark:text-violet-400">
            Go to planner →
          </span>
        </Link>

        <Link
          to="/analytics"
          className="group glass-card flex flex-col justify-between rounded-2xl p-6 transition hover:border-violet-400/50"
        >
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">View analytics</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Focus trend, completions, and missed signals — the same engine that powers adaptive rescheduling.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-violet-600 group-hover:translate-x-0.5 dark:text-violet-400">
            Go to analytics →
          </span>
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Snapshot</p>
        <div className="mt-4 max-w-md">
          <IllustrationProductivity className="w-full" />
        </div>
      </div>

      {streakInfoOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setStreakInfoOpen(false)}
          />
          <div className="relative z-10 max-w-md animate-slide-up rounded-2xl border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">How streaks work</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Your streak increases when you open StudyFlow on consecutive days. Missing a day resets the count to one — small,
              steady sessions still count.
            </p>
            <button
              type="button"
              onClick={() => setStreakInfoOpen(false)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
