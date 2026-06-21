import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserDataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getTodayIndex } from "../lib/constants.js";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, setTasks, hydrated } = useUserData();
  const navigate = useNavigate();

  const todayIndex = getTodayIndex();
  const todayTasks = useMemo(() => tasks.filter((t) => t.dayIndex === todayIndex), [tasks, todayIndex]);

  const [aiReport] = useState(() => {
    try {
      const saved = localStorage.getItem("studyflow_ai_report");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [weakSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem("studyflow_weak_subjects");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quickDoubt, setQuickDoubt] = useState("");
  const [doubtType, setDoubtType] = useState("general");

  const toggleTaskCompletion = (taskId, currentProgress) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, progress: currentProgress >= 100 ? 0 : 100 }
          : t
      )
    );
  };

  const handleQuickDoubtSubmit = (e) => {
    e.preventDefault();
    if (!quickDoubt.trim()) return;
    navigate("/doubt-solver", {
      state: {
        initialQuestion: quickDoubt,
        selectedType: doubtType,
      },
    });
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-955 p-6 md:p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Welcome back, {user?.name || "Student"}!
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            Here is your live study session dashboard. Keep track of today's goals, ask quick doubts, and stay aligned with your syllabus.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left/Middle Column (Today's Tasks & Study Plan) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Tasks Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📅</span> Today's Task Queue
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-105 text-violet-850 dark:bg-violet-500/10 dark:text-violet-400">
                  {todayTasks.filter(t => t.progress >= 100).length}/{todayTasks.length} Done
                </span>
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No study tasks scheduled for today.
                  </p>
                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-700 transition"
                  >
                    Go to Planner to Add Tasks
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition hover:border-violet-500/30 dark:border-white/5 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTaskCompletion(task.id, task.progress)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                            task.progress >= 100
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-violet-500"
                          }`}
                        >
                          {task.progress >= 100 && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <p className={`text-sm font-semibold transition ${
                            task.progress >= 100
                              ? "text-slate-400 dark:text-slate-550 line-through"
                              : "text-slate-800 dark:text-slate-200"
                          }`}>
                            {task.title}
                          </p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ⏱️ {task.duration}
                          </span>
                        </div>
                      </div>

                      <div className="w-24 shrink-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {todayTasks.length > 0 && (
              <Link
                to="/planner"
                className="mt-4 block text-center text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
              >
                Go to Planner Workspace →
              </Link>
            )}
          </div>

          {/* Active AI Study Strategy */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4 flex items-center gap-2">
              <span>📋</span> Active AI Study Strategy
            </h3>

            {aiReport ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Weekly Focus Plan
                  </h4>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-355 leading-relaxed">
                    {aiReport.weeklyPlan}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Subject Targets
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {aiReport.studyTargets.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-violet-500 mt-0.5">🎯</span>
                        <span>
                          <strong className="text-slate-900 dark:text-slate-200">{item.subject}</strong>: {item.target}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Revision Schedule
                  </h4>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiReport.revisionSchedule}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No active AI study plan compiled.
                </p>
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-violet-700 transition"
                >
                  Generate Plan in Study Planner
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Quick Doubt Solver & Weak Subjects) */}
        <div className="space-y-6">
          {/* Quick Doubt Solver */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4 flex items-center gap-2">
              <span>💬</span> Ask StudyAI Tutor
            </h3>
            
            <form onSubmit={handleQuickDoubtSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Tutor Mode
                </label>
                <select
                  value={doubtType}
                  onChange={(e) => setDoubtType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <option value="general">💬 General Chat</option>
                  <option value="definition">📖 Definition Question</option>
                  <option value="concept">💡 Concept Explanation</option>
                  <option value="coding">💻 Coding Problem</option>
                  <option value="math">🔢 Math Solution Steps</option>
                  <option value="complex">🧬 Explain Complex Topic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Doubt / Question
                </label>
                <textarea
                  value={quickDoubt}
                  onChange={(e) => setQuickDoubt(e.target.value)}
                  placeholder="Ask any study question..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!quickDoubt.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send to Tutor →
              </button>
            </form>
          </div>

          {/* Weak Subjects / Focus Areas */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4 flex items-center gap-2">
              <span>🧬</span> Subjects Needing Focus
            </h3>
            
            {weakSubjects.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                No weak subjects detected yet. As you ask the Doubt Solver questions, subjects needing focus will appear here automatically.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  These subjects were auto-logged based on your recent doubts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakSubjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-450"
                    >
                      ⚠️ {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Tools Navigation */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Quick Tools
            </h4>
            <Link
              to="/notes"
              className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-755 hover:border-violet-500/30 hover:bg-slate-100/50 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800/40"
            >
              <span>📄 Notes & Flashcards Generator</span>
              <span>→</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-755 hover:border-violet-500/30 hover:bg-slate-100/50 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800/40"
            >
              <span>📊 Detailed Study Analytics</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
