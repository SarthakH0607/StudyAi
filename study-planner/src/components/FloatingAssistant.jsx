import { AvatarOrb } from "./Illustrations.jsx";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FloatingAssistant({ visible, secondsLeft, message }) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex max-w-sm animate-slide-up flex-col items-end gap-3 sm:bottom-8 sm:right-8"
      role="status"
      aria-live="polite"
    >
      <div className="glass-card flex items-start gap-3 rounded-2xl border border-indigo-200/50 bg-white/80 p-4 shadow-xl dark:border-violet-500/20 dark:bg-slate-900/80">
        <AvatarOrb className="h-12 w-12 shrink-0" />
        <div>
          <p className="font-display text-sm font-semibold text-indigo-900 dark:text-violet-200">StudyFlow</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {message || `Stay focused 🔥 ${formatTime(secondsLeft)} left!`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 backdrop-blur-md dark:text-violet-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
        </span>
        Focus session active
      </div>
    </div>
  );
}
