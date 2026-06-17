import { IllustrationAI } from "./Illustrations.jsx";

const suggestions = [
  "Tackle your shortest task next — momentum builds fast.",
  "Try a 25-minute sprint, then a 5-minute walk.",
  "Review flashcards before bed for stronger recall.",
  "Batch similar topics to reduce context switching.",
];

export function StreakAndAI({ streak, suggestionIndex, onRotateSuggestion }) {
  const tip = suggestions[suggestionIndex % suggestions.length];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-2xl shadow-lg">
          🔥
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Streak</p>
          <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">{streak} days</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Keep showing up — the AI adapts to you.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRotateSuggestion}
        className="glass-card w-full overflow-hidden rounded-2xl text-left transition hover:border-indigo-300/60 dark:hover:border-violet-500/40"
      >
        <div className="border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 p-3 dark:border-violet-500/10 dark:from-indigo-950/50 dark:to-violet-950/40">
          <IllustrationAI className="mx-auto max-h-24" />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">AI suggestion</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{tip}</p>
          <p className="mt-3 text-xs font-medium text-violet-600 dark:text-violet-400">Tap for another tip →</p>
        </div>
      </button>
    </div>
  );
}
