export function RescheduleToast({ visible, onDismiss }) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[65] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-slide-up sm:bottom-8">
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-emerald-500/30 dark:bg-slate-900/95">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-lg text-white">
          ✨
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Plan updated</p>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            We’ve adjusted your plan to keep you on track.
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
