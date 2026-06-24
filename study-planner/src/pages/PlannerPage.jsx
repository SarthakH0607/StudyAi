import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DistractionAlert } from "../components/DistractionAlert.jsx";
import { FloatingAssistant } from "../components/FloatingAssistant.jsx";
import { FocusMonitor } from "../components/FocusMonitor.jsx";
import { RescheduleToast } from "../components/RescheduleToast.jsx";
import { NotesPanelModal, ResourceModal } from "../components/ResourceModal.jsx";
import { SmartCalendar } from "../components/SmartCalendar.jsx";
import { StreakAndAI } from "../components/StreakAndAI.jsx";
import { TodayTasks } from "../components/TodayTasks.jsx";
import { useUserData } from "../context/UserDataContext.jsx";
import { DAY_LABELS, getTodayIndex } from "../lib/constants.js";

const FOCUS_DURATION = 120;
const IDLE_MS = 8000;

export default function PlannerPage() {
  const {
    tasks,
    setTasks,
    streak,
    suggestionIndex,
    setSuggestionIndex,
    bumpWeeklyFocusHours,
    hydrated,
  } = useUserData();

  const todayIndex = getTodayIndex();

  const [focusActive, setFocusActive] = useState(false);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(FOCUS_DURATION);
  const [showDistraction, setShowDistraction] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const distractionFiredRef = useRef(false);
  const sessionCompletedRef = useRef(false);
  const [idleTick, setIdleTick] = useState(0);

  const [calendarShifting, setCalendarShifting] = useState(false);
  const [showRescheduleToast, setShowRescheduleToast] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [resourceTask, setResourceTask] = useState(null);
  const [revisionNotesOpen, setRevisionNotesOpen] = useState(false);

  // Smart Planner Inputs state
  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState("");
  const [availableHours, setAvailableHours] = useState("4");
  const [priorityLevel, setPriorityLevel] = useState("Medium");
  const [standardLevel, setStandardLevel] = useState("10th Standard");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [plannerError, setPlannerError] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  
  // Storing generated plan details
  const [aiReport, setAiReport] = useState(() => {
    const saved = localStorage.getItem("studyflow_ai_report");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setHasApiKey(data.hasApiKey);
      } catch (e) {
        setHasApiKey(false);
      }
    };
    checkConfig();
  }, []);

  useEffect(() => {
    if (!showRescheduleToast) return;
    const t = window.setTimeout(() => setShowRescheduleToast(false), 6000);
    return () => window.clearTimeout(t);
  }, [showRescheduleToast]);

  // Auto-populate default subjects based on chosen syllabus grade standardLevel
  useEffect(() => {
    const defaultSubjects = {
      "5th Standard": "Mathematics, Science / EVS, Social Studies",
      "6th Standard": "Mathematics, Science, Social Science",
      "7th Standard": "Mathematics, Science, Social Science",
      "8th Standard": "Mathematics, Science, Social Science",
      "9th Standard": "Mathematics, Science, Social Science",
      "10th Standard": "Mathematics, Science, Social Science",
      "11th Standard (Science)": "Physics, Chemistry, Mathematics, Biology",
      "12th Standard (Science)": "Physics, Chemistry, Mathematics, Biology",
      "11th Standard (Commerce)": "Accounts, Economics, Business Studies",
      "12th Standard (Commerce)": "Accounts, Economics, Business Studies",
      "11th Standard (Arts)": "History, Geography, Political Science, Sociology",
      "12th Standard (Arts)": "History, Geography, Political Science, Sociology",
    };
    if (defaultSubjects[standardLevel]) {
      setSubjects(defaultSubjects[standardLevel]);
    }
  }, [standardLevel]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!focusActive) return;
    const onInput = () => resetActivity();
    ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, onInput, { passive: true })
    );
    return () => {
      ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach((ev) =>
        window.removeEventListener(ev, onInput)
      );
    };
  }, [focusActive, resetActivity]);

  useEffect(() => {
    if (!focusActive) return;
    const id = window.setInterval(() => {
      setFocusSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
      setIdleTick((x) => x + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusActive]);

  useEffect(() => {
    if (!focusActive || focusSecondsLeft > 0) return;
    if (!sessionCompletedRef.current) {
      sessionCompletedRef.current = true;
      bumpWeeklyFocusHours(FOCUS_DURATION / 3600);
    }
    setFocusActive(false);
    distractionFiredRef.current = false;
    setShowDistraction(false);
  }, [focusActive, focusSecondsLeft, bumpWeeklyFocusHours]);

  useEffect(() => {
    if (!focusActive || distractionFiredRef.current || showDistraction) return;
    if (Date.now() - lastActivityRef.current >= IDLE_MS) {
      distractionFiredRef.current = true;
      setShowDistraction(true);
    }
  }, [focusActive, idleTick, showDistraction]);

  const secondsSinceActivity = focusActive
    ? Math.floor((Date.now() - lastActivityRef.current) / 1000)
    : 0;

  const startFocus = () => {
    sessionCompletedRef.current = false;
    distractionFiredRef.current = false;
    setShowDistraction(false);
    setFocusSecondsLeft(FOCUS_DURATION);
    lastActivityRef.current = Date.now();
    setFocusActive(true);
  };

  const stopFocus = () => {
    setFocusActive(false);
    distractionFiredRef.current = false;
    setShowDistraction(false);
  };

  const simulateIdle = () => {
    lastActivityRef.current = Date.now() - IDLE_MS - 500;
    setIdleTick((x) => x + 1);
  };

  const todayTasks = useMemo(() => tasks.filter((t) => t.dayIndex === todayIndex), [tasks, todayIndex]);

  const firstTaskTitle = todayTasks[0]?.title ?? "General study session";

  const calendarDays = useMemo(() => {
    return DAY_LABELS.map((label, dayIndex) => ({
      label,
      tasks: tasks
        .filter((t) => t.dayIndex === dayIndex)
        .map((t) => ({ id: t.id, title: t.title })),
    }));
  }, [tasks]);


  const onProgressChange = (id, progress) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress } : t)));
  };

  const runCalendarShift = (withToast) => {
    setCalendarShifting(true);
    window.setTimeout(() => setCalendarShifting(false), 700);
    if (withToast) {
      setShowRescheduleToast(true);
      setSuggestionIndex((i) => i + 1);
    }
  };

  const onMarkMissed = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextDay = Math.min(6, t.dayIndex + 1);
        return { ...t, missed: true, dayIndex: nextDay, progress: Math.max(0, t.progress - 15) };
      })
    );
    runCalendarShift(true);
  };

  const onDropOnDay = (taskId, newDayIndex) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, dayIndex: newDayIndex } : t)));
    runCalendarShift(false);
  };

  const assistantMessage =
    focusSecondsLeft > 0
      ? `Stay focused 🔥 ${Math.floor(focusSecondsLeft / 60)}:${(focusSecondsLeft % 60).toString().padStart(2, "0")} left!`
      : "Great session — want to queue the next block?";

  const onRotateSuggestion = () => setSuggestionIndex((i) => i + 1);

  // Auto-adjust unfinished tasks (shifts past days' incomplete tasks to today)
  const handleAutoAdjust = () => {
    setTasks((prev) => {
      let shifted = false;
      const next = prev.map((t) => {
        // If task is from a previous day index and is not complete (progress < 100)
        if (t.dayIndex < todayIndex && t.progress < 100) {
          shifted = true;
          return { ...t, dayIndex: todayIndex, missed: true };
        }
        return t;
      });
      if (shifted) {
        runCalendarShift(true);
      }
      return next;
    });
  };

  // Generate Smart Study Plan via AI Backend API
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!examDate || !subjects.trim()) {
      setPlannerError("Please select an Exam Date and enter your Subjects.");
      return;
    }

    setGeneratingPlan(true);
    setPlannerError(null);

    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examDate,
          subjects,
          hoursPerDay: Number(availableHours),
          priority: priorityLevel,
          standard: standardLevel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate schedule from AI.");
      }

      const data = await res.json();

      // Clear existing tasks and map AI tasks
      const mapDayToIdx = (dayStr) => {
        const mapping = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
        return mapping[dayStr.toLowerCase().slice(0, 3)] ?? 0;
      };

      const newTasks = [];
      if (data.dailyPlan && Array.isArray(data.dailyPlan)) {
        data.dailyPlan.forEach((dayPlan) => {
          const dIndex = mapDayToIdx(dayPlan.day);
          if (dayPlan.tasks && Array.isArray(dayPlan.tasks)) {
            dayPlan.tasks.forEach((task, tIdx) => {
              newTasks.push({
                id: `ai-${dIndex}-${tIdx}-${Date.now()}`,
                title: task.title,
                duration: task.duration || "45 min block",
                progress: 0,
                missed: false,
                dayIndex: dIndex,
              });
            });
          }
        });
      }

      setTasks(newTasks);

      if (data.error) {
        setPlannerError(`⚠️ Live AI Fallback Active: ${data.error}. Running in Simulated AI Mode.`);
      }

      // Save the other AI reports
      const report = {
        weeklyPlan: data.weeklyPlan,
        studyTargets: data.studyTargets,
        revisionSchedule: data.revisionSchedule,
        generatedAt: new Date().toLocaleDateString(),
      };
      setAiReport(report);
      localStorage.setItem("studyflow_ai_report", JSON.stringify(report));
      
      // Flash a success toast
      setShowRescheduleToast(true);
    } catch (err) {
      console.error(err);
      setPlannerError(err.message || "An error occurred while communicating with the scheduler.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Study Planner</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            A real-time workspace with distraction sensors, calendar drag-and-drop, and AI study plan compilation.
          </p>
        </div>
        
        <button
          onClick={handleAutoAdjust}
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm"
        >
          🔄 Auto-Adjust Unfinished Tasks
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Work Area */}
        <div className="space-y-8 lg:col-span-2">
          {/* Smart Study Planner Form */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white mb-4">
              ✨ AI Smart Study Planner
            </h3>
            
            <form onSubmit={handleGeneratePlan} className="grid gap-4 sm:grid-cols-5 items-end">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>
              
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Subjects
                </label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Math, Science, Social..."
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Syllabus Grade
                </label>
                <select
                  value={standardLevel}
                  onChange={(e) => setStandardLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <option value="5th Standard">5th Standard</option>
                  <option value="6th Standard">6th Standard</option>
                  <option value="7th Standard">7th Standard</option>
                  <option value="8th Standard">8th Standard</option>
                  <option value="9th Standard">9th Standard</option>
                  <option value="10th Standard">10th Standard</option>
                  <option value="11th Standard (Science)">11th Sci</option>
                  <option value="12th Standard (Science)">12th Sci</option>
                  <option value="11th Standard (Commerce)">11th Com</option>
                  <option value="12th Standard (Commerce)">12th Com</option>
                  <option value="11th Standard (Arts)">11th Arts</option>
                  <option value="12th Standard (Arts)">12th Arts</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Hours / Day
                </label>
                <select
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="6">6 Hours</option>
                  <option value="8">8 Hours</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <button
                  type="submit"
                  disabled={generatingPlan || !hasApiKey}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-xs font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-50"
                >
                  {generatingPlan ? "Building..." : "Generate AI Plan"}
                </button>
              </div>
            </form>

            {plannerError && (
              <div className="mt-4 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-450">
                <p>{plannerError}</p>
                {!hasApiKey && (
                  <Link to="/settings" className="mt-1 block font-bold text-violet-600 dark:text-violet-400 hover:underline">
                    Connect your AI API key in Settings to activate StudyAI.
                  </Link>
                )}
              </div>
            )}
          </div>

          <StreakAndAI streak={streak} suggestionIndex={suggestionIndex} onRotateSuggestion={onRotateSuggestion} />
          
          <TodayTasks
            tasks={todayTasks}
            onProgressChange={onProgressChange}
            onGetHelp={(task) => setResourceTask({ title: task.title })}
            onMarkMissed={onMarkMissed}
          />
          
          <SmartCalendar
            days={calendarDays}
            todayIndex={todayIndex}
            shifting={calendarShifting}
            draggedId={draggedId}
            onDragStart={setDraggedId}
            onDropOnDay={onDropOnDay}
          />
        </div>

        {/* Sidebar Controls & AI Strategy Report */}
        <div className="space-y-8">
          <FocusMonitor
            focusActive={focusActive}
            idleSeconds={secondsSinceActivity}
            onStartFocus={startFocus}
            onStopFocus={stopFocus}
            onSimulateIdle={simulateIdle}
          />

          {aiReport && (
            <div className="glass-card rounded-2xl p-5 space-y-4 text-left animate-slide-up">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200/50 pb-2 dark:border-white/10">
                📋 AI Study strategy (Generated: {aiReport.generatedAt})
              </h3>
              
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Goals</h4>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed mt-1">
                  {aiReport.weeklyPlan}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Targets</h4>
                <ul className="mt-1.5 space-y-1">
                  {aiReport.studyTargets.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                      🎯 <strong className="text-slate-800 dark:text-slate-200">{item.subject}</strong>: {item.target}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revision Timeline</h4>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed mt-1">
                  {aiReport.revisionSchedule}
                </p>
              </div>
            </div>
          )}


        </div>
      </div>

      <FloatingAssistant visible={focusActive && focusSecondsLeft > 0} secondsLeft={focusSecondsLeft} message={assistantMessage} />

      <DistractionAlert
        open={showDistraction}
        onDismiss={() => {
          setShowDistraction(false);
          resetActivity();
        }}
        onQuickRevision={() => {
          setShowDistraction(false);
          resetActivity();
          setRevisionNotesOpen(true);
        }}
      />

      <RescheduleToast visible={showRescheduleToast} onDismiss={() => setShowRescheduleToast(false)} />

      <ResourceModal taskTitle={resourceTask?.title} onClose={() => setResourceTask(null)} />

      <NotesPanelModal taskTitle={revisionNotesOpen ? firstTaskTitle : null} onClose={() => setRevisionNotesOpen(false)} />
    </div>
  );
}
