import { IllustrationStudent } from "./Illustrations.jsx";

export function DistractionAlert({ open, onDismiss, onQuickRevision }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close overlay"
        onClick={onDismiss}
      />
      <div
        className="relative z-10 w-full max-w-md animate-slide-up overflow-hidden rounded-2xl border border-amber-200/50 bg-white/90 shadow-2xl dark:border-amber-500/20 dark:bg-slate-900/95"
        role="alertdialog"
        aria-labelledby="distraction-title"
        aria-describedby="distraction-desc"
      >
        <div className="border-b border-amber-100/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-900/30 dark:from-amber-950/40 dark:to-orange-950/30">
          <IllustrationStudent className="mx-auto max-h-28" />
        </div>
        <div className="p-6">
          <h2 id="distraction-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Focus check-in
          </h2>
          <p id="distraction-desc" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            You seem distracted. Switch to quick revision?
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Keep studying
            </button>
            <button
              type="button"
              onClick={onQuickRevision}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
            >
              Quick revision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
