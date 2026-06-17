import { useMemo, useState, useEffect } from "react";
import { useUserData } from "../context/UserDataContext.jsx";

function ProgressChart({ points }) {
  const max = Math.max(...points, 1);
  const w = 500;
  const h = 150;
  const pad = 12;
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full text-violet-500" aria-hidden>
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${pad + (points.length - 1) * step} ${h} L ${pad} ${h} Z`}
        fill="url(#chartGradient)"
        className="text-violet-500"
      />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = pad + i * step;
        const y = h - pad - (p / max) * (h - pad * 2);
        return (
          <g key={i} className="group/dot">
            <circle
              cx={x}
              cy={y}
              r="5"
              className="fill-white stroke-violet-500 dark:fill-slate-900 transition-all duration-200 group-hover/dot:r-7"
              strokeWidth="2.5"
            />
            <text
              x={x}
              y={y - 10}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200"
            >
              {p.toFixed(1)}h
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProgressTracker() {
  const { tasks, streak, weeklyFocus, hydrated } = useUserData();
  const [weakSubjects, setWeakSubjects] = useState([]);

  // Load weak subjects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("studyflow_weak_subjects");
    if (saved) {
      setWeakSubjects(JSON.parse(saved));
    }
  }, []);

  const clearWeakSubjects = () => {
    localStorage.removeItem("studyflow_weak_subjects");
    setWeakSubjects([]);
  };

  const totals = useMemo(() => {
    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.progress >= 100).length;
    const missedCount = tasks.filter((t) => t.missed).length;
    
    // Average completion percentage
    const avgProgress = totalCount === 0 ? 0 : Math.round(tasks.reduce((a, t) => a + t.progress, 0) / totalCount);
    
    // Total study hours logged in chart
    const totalHours = weeklyFocus.reduce((a, h) => a + h, 0);

    return {
      totalCount,
      completedCount,
      missedCount,
      avgProgress,
      totalHours,
    };
  }, [tasks, weeklyFocus]);

  // Dynamic AI study recommendations based on metrics
  const aiRecommendations = useMemo(() => {
    const recs = [];

    if (streak > 3) {
      recs.push({
        title: "🔥 Study Streak Active",
        text: `You have maintained a streak of ${streak} days! Keep up the consistency by executing at least one 30-minute study sprint today.`,
        badge: "Streak High",
        color: "orange"
      });
    } else {
      recs.push({
        title: "⚡ Build Consistency",
        text: "Your study streak resets if you skip calendar days. Open the Planner Page and log at least 15 minutes of work to start a streak.",
        badge: "Streak Low",
        color: "indigo"
      });
    }

    if (weakSubjects.length > 0) {
      recs.push({
        title: "🔑 Target Weak Subjects",
        text: `Based on your recent solved doubts, you should pay special attention to: ${weakSubjects.join(", ")}. Try generating Short Notes or Flashcards for these topics.`,
        badge: "Focal Area",
        color: "rose"
      });
    } else {
      recs.push({
        title: "🧬 Diversify Subjects",
        text: "You haven't solved doubts in any specific subject recently. Use the AI Doubt Solver when you encounter tricky topics to get instant step-by-step logic.",
        badge: "Doubt Solver",
        color: "emerald"
      });
    }

    if (totals.avgProgress < 50 && totals.totalCount > 0) {
      recs.push({
        title: "📅 Reschedule Blockers",
        text: "You have several unfinished tasks. Use the 'Auto-Adjust Unfinished Tasks' button on the Planner page to balance your calendar.",
        badge: "Calendar",
        color: "amber"
      });
    } else if (totals.completedCount > 0) {
      recs.push({
        title: "🌟 High Performance",
        text: `You have completed ${totals.completedCount} tasks! Keep the momentum by starting a Focus block to lock in deep work.`,
        badge: "Milestone",
        color: "emerald"
      });
    }

    return recs;
  }, [streak, weakSubjects, totals]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" aria-label="Loading" />
      </div>
    );
  }

  const daysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-8 animate-slide-up text-left">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Progress Tracker</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Monitor your study momentum, streaks, weak subjects, and AI study recommendations.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-orange-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Streak</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{streak} Days</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Keep visiting daily to level up</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-violet-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Hours (Week)</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{totals.totalHours.toFixed(1)}h</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Logged via Focus sessions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tasks Completed</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
            {totals.completedCount} / {totals.totalCount}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Completion rate looks healthy</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion rate</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{totals.avgProgress}%</p>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${totals.avgProgress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Study Hours Trend Graph */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Weekly Focus Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hours logged during interactive focus sprints
            </p>
          </div>

          <ProgressChart points={weeklyFocus} />
          
          <div className="flex justify-between px-3 text-xs font-semibold text-slate-500">
            {daysLabels.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>

        {/* Weak Subjects Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 dark:border-white/10 mb-4">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                ⚠️ Weak Subjects
              </h3>
              {weakSubjects.length > 0 && (
                <button
                  onClick={clearWeakSubjects}
                  className="text-[10px] text-rose-500 hover:underline font-bold"
                >
                  Clear list
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Subjects listed here are dynamically identified based on the topic keywords of solved doubts in Doubt Solver.
            </p>

            <div className="mt-5 space-y-2.5">
              {weakSubjects.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <span>👍</span>
                  <p className="mt-1">No weak subjects detected yet. Keep study flow active!</p>
                </div>
              ) : (
                weakSubjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-rose-500/5 border border-rose-500/10 px-4 py-3 text-xs text-rose-800 dark:text-rose-300 font-semibold"
                  >
                    <span>📖 {sub}</span>
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px]">Review advised</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-6 pt-3 border-t border-slate-200/50 dark:border-white/10">
            Asking doubts about Calculus, Javascript, Photosynthesis, or Organic Chemistry automatically lists targets here.
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white border-b border-slate-200/50 pb-3 dark:border-white/10 mb-6">
          ✨ StudyAI Recommendations
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {aiRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${
                rec.color === "orange"
                  ? "border-orange-200 bg-orange-500/5 text-orange-950 dark:border-orange-500/10 dark:text-orange-200"
                  : rec.color === "rose"
                  ? "border-rose-200 bg-rose-500/5 text-rose-950 dark:border-rose-500/10 dark:text-rose-200"
                  : rec.color === "amber"
                  ? "border-amber-200 bg-amber-500/5 text-amber-950 dark:border-amber-500/10 dark:text-amber-200"
                  : "border-indigo-200 bg-indigo-500/5 text-indigo-950 dark:border-indigo-500/10 dark:text-indigo-200"
              }`}
            >
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3 ${
                  rec.color === "orange"
                    ? "bg-orange-500/15 text-orange-700 dark:text-orange-400"
                    : rec.color === "rose"
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-450"
                    : rec.color === "amber"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
                }`}>
                  {rec.badge}
                </span>
                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {rec.title}
                </h4>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                  {rec.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
