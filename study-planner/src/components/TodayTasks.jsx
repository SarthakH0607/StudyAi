export function TodayTasks({ tasks, onProgressChange, onGetHelp, onMarkMissed }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Today</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive queue — progress syncs with your focus score.</p>
        </div>
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
          {tasks.filter((t) => t.progress >= 100).length}/{tasks.length} done
        </span>
      </div>

      <ul className="mt-5 space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`rounded-xl border border-slate-200/80 bg-white/60 p-4 transition dark:border-white/10 dark:bg-white/5 ${
              task.missed ? "border-amber-300/60 opacity-80 dark:border-amber-500/30" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{task.duration}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onGetHelp(task)}
                  className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-950/60"
                >
                  Get help
                </button>
                <button
                  type="button"
                  onClick={() => onMarkMissed(task.id)}
                  className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Simulate missed
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, task.progress)}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={task.progress}
                onChange={(e) => onProgressChange(task.id, Number(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-violet-600"
                aria-label={`Progress for ${task.title}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
