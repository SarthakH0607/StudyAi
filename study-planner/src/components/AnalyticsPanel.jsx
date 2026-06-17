import { IllustrationProductivity } from "./Illustrations.jsx";

function MiniChart({ points }) {
  const max = Math.max(...points, 1);
  const w = 280;
  const h = 96;
  const pad = 8;
  const denom = Math.max(1, points.length - 1);
  const step = (w - pad * 2) / denom;
  const d = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - (p / max) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full text-violet-500" aria-hidden>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${pad + (points.length - 1) * step} ${h} L ${pad} ${h} Z`}
        fill="url(#chartFill)"
        className="text-violet-500"
      />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = pad + i * step;
        const y = h - pad - (p / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="4" className="fill-white stroke-violet-500 dark:fill-slate-900" strokeWidth="2" />;
      })}
    </svg>
  );
}

export function AnalyticsPanel({ focusScore, completed, missed, weeklyFocus }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Analytics</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">Signals the adaptive engine uses for rescheduling.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-500/20 dark:from-indigo-950/40 dark:to-violet-950/30">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300">Focus score</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white">{focusScore}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Rolling 7-day model</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/25">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Completed</p>
          <p className="mt-1 font-display text-3xl font-bold text-emerald-800 dark:text-emerald-300">{completed}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-950/25">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Missed</p>
          <p className="mt-1 font-display text-3xl font-bold text-amber-900 dark:text-amber-200">{missed}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Focus trend (hours)</p>
        <MiniChart points={weeklyFocus} />
        <div className="flex justify-between px-1 text-[10px] font-medium text-slate-400">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <IllustrationProductivity className="w-full" />
      </div>
    </div>
  );
}
