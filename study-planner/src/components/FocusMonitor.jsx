export function FocusMonitor({
  focusActive,
  idleSeconds,
  onStartFocus,
  onStopFocus,
  onSimulateIdle,
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Focus Monitor</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Simulated inactivity detection while a focus session runs.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            focusActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-slate-500/10 text-slate-500 dark:text-slate-400"
          }`}
        >
          {focusActive ? "Live" : "Idle"}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Activity window</p>
        <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-indigo-600 dark:text-violet-400">
          {focusActive ? `${idleSeconds}s` : "—"} <span className="text-sm font-normal text-slate-400">since last input</span>
        </p>
        <p className="mt-2 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
          Threshold: 8s stillness triggers a gentle nudge (demo).
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!focusActive ? (
          <button
            type="button"
            onClick={onStartFocus}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.98]"
          >
            Start 2-min focus
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopFocus}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            End session
          </button>
        )}
        <button
          type="button"
          onClick={onSimulateIdle}
          disabled={!focusActive}
          className="rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-violet-500/40 dark:bg-violet-950/30 dark:text-violet-200 dark:hover:bg-violet-950/50"
        >
          Simulate idle
        </button>
      </div>
    </div>
  );
}
