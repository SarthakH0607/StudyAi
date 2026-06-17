export function SmartCalendar({ days, todayIndex, shifting, onDragStart, onDropOnDay, draggedId }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Smart reschedule</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag tasks between days — the engine rebalances load automatically.
          </p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
          Live calendar
        </span>
      </div>

      <div
        className={`mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 ${shifting ? "animate-shift" : ""}`}
      >
        {days.map((day, dayIndex) => (
          <div
            key={day.label}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task-id");
              if (id) onDropOnDay(id, dayIndex);
            }}
            className={`flex min-h-[140px] flex-col rounded-xl border border-dashed border-slate-200/90 bg-slate-50/50 p-2 transition-colors dark:border-white/10 dark:bg-white/5 ${
              dayIndex === todayIndex ? "ring-2 ring-violet-400/50 dark:ring-violet-500/40" : ""
            } ${draggedId ? "border-violet-300/60 dark:border-violet-500/30" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{day.label}</span>
              {dayIndex === todayIndex && (
                <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:text-violet-300">
                  Today
                </span>
              )}
            </div>
            <ul className="flex flex-1 flex-col gap-1.5">
              {day.tasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/task-id", t.id);
                      e.dataTransfer.effectAllowed = "move";
                      onDragStart(t.id);
                    }}
                    onDragEnd={() => onDragStart(null)}
                    className="w-full cursor-grab rounded-lg border border-slate-200/80 bg-white/90 px-2 py-2 text-left text-xs font-medium text-slate-800 shadow-sm transition hover:border-violet-300 hover:shadow-md active:cursor-grabbing dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-violet-500/50"
                  >
                    {t.title}
                  </button>
                </li>
              ))}
              {day.tasks.length === 0 && (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-transparent py-4 text-[10px] text-slate-400">
                  Drop here
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
