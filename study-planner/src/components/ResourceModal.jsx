import { useEffect, useMemo, useState } from "react";

const RESOURCES = [
  {
    id: "video",
    title: "Video explanation",
    desc: "Targeted educational lectures on YouTube for this topic.",
    icon: "▶️",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    id: "notes",
    title: "Smart notes",
    desc: "AI revision outline with core concepts and study guides.",
    icon: "📄",
    accent: "from-violet-500 to-purple-600",
  },
  {
    id: "quiz",
    title: "Practice quiz",
    desc: "AI-generated check for understanding matching this topic.",
    icon: "✓",
    accent: "from-emerald-500 to-teal-500",
  },
];

function NotesContent({ taskTitle }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskTitle) return;
    const loadNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/task-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskTitle, type: "notes" })
        });
        if (!res.ok) throw new Error("Could not compile dynamic revision notes.");
        const data = await res.json();
        setNotes(data.notes);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [taskTitle]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" />
        <p className="text-xs text-slate-500">Compiling revision outline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-xs text-rose-500">
        ⚠️ Error: {error}
      </div>
    );
  }

  const formatHtml = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return <h4 key={idx} className="font-display text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{trimmed.slice(2)}</h4>;
      }
      if (trimmed.startsWith("## ")) {
        return <h5 key={idx} className="font-display text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">{trimmed.slice(3)}</h5>;
      }
      if (trimmed.startsWith("### ")) {
        return <h6 key={idx} className="font-display text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 mb-1">{trimmed.slice(4)}</h6>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc text-xs text-slate-650 dark:text-slate-350 py-0.5">{trimmed.slice(2)}</li>;
      }
      if (!trimmed) return <div key={idx} className="h-2.5" />;
      return <p key={idx} className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed mb-1.5">{trimmed}</p>;
    });
  };

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-1 text-left space-y-1">
      {formatHtml(notes)}
    </div>
  );
}

export function ResourceModal({ taskTitle, onClose }) {
  const [view, setView] = useState("list");
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    if (!taskTitle) return;
    setView("list");
    setQuizQuestions([]);
    setAnswers([]);
    setSubmitted(false);
    setQuizError(null);
  }, [taskTitle]);

  const loadQuizData = async () => {
    setView("quiz");
    setLoadingQuiz(true);
    setQuizError(null);
    setSubmitted(false);
    
    try {
      const res = await fetch("/api/task-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle, type: "quiz" })
      });
      if (!res.ok) throw new Error("Failed to generate practice quiz.");
      const data = await res.json();
      setQuizQuestions(data);
      setAnswers(data.map(() => null));
    } catch (e) {
      setQuizError(e.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const score = useMemo(() => {
    if (!submitted || quizQuestions.length === 0) return null;
    let n = 0;
    quizQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) n += 1;
    });
    return n;
  }, [answers, submitted, quizQuestions]);

  if (!taskTitle) return null;

  const resetQuiz = () => {
    setAnswers(quizQuestions.map(() => null));
    setSubmitted(false);
  };

  const goBack = () => {
    if (view === "list") onClose();
    else {
      setView("list");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              {view === "list" ? "Resources" : view === "video" ? "Lecture" : view === "notes" ? "Notes" : "Quiz"}
            </p>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {view === "list" ? `Help for “${taskTitle}”` : view === "video" ? "Search lecture" : view === "notes" ? "Study notes" : "Quick quiz"}
            </h2>
          </div>
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={view === "list" ? "Close modal" : "Back"}
          >
            {view === "list" ? "✕" : "←"}
          </button>
        </div>

        {view === "list" && (
          <>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Pick a resource format to generate study aids for this topic.
            </p>
            <ul className="mt-5 grid gap-3">
              {RESOURCES.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (r.id === "quiz") {
                        loadQuizData();
                      } else {
                        setView(r.id);
                      }
                    }}
                    className="group flex w-full items-start gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-left transition hover:border-violet-300 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/40"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white shadow-md ${r.accent}`}
                    >
                      {r.icon}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900 dark:text-white">{r.title}</span>
                      <span className="mt-1 block text-sm text-slate-650 dark:text-slate-400">{r.desc}</span>
                      <span className="mt-2 inline-block text-xs font-semibold text-violet-600 dark:text-violet-400">
                        Open →
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {view === "video" && (
          <div className="mt-4 text-left space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We recommend reviewing visual lectures on YouTube to master this topic. Search for the recommended keywords or click below to launch search directly.
            </p>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-950/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Suggested Search</h4>
              <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-250 mt-1">
                "{taskTitle} explanation lecture"
              </p>
            </div>
            
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(taskTitle + " explanation lecture")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-650 to-red-500 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 text-center bg-red-600"
            >
              📺 Open YouTube Search
            </a>
          </div>
        )}

        {view === "notes" && (
          <div className="mt-4">
            <NotesContent taskTitle={taskTitle} />
          </div>
        )}

        {view === "quiz" && (
          <div className="mt-4 space-y-5 overflow-y-auto max-h-[65vh] pr-1">
            {loadingQuiz && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" />
                <p className="text-xs text-slate-500">Creating custom quiz questions...</p>
              </div>
            )}

            {quizError && (
              <p className="py-6 text-center text-xs text-rose-500">
                ⚠️ Error generating quiz: {quizError}
              </p>
            )}

            {!loadingQuiz && !quizError && quizQuestions.map((item, qi) => (
              <fieldset key={qi} className="text-left rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                <legend className="text-xs font-bold text-slate-900 dark:text-white">
                  {qi + 1}. {item.q}
                </legend>
                <div className="mt-3 space-y-2">
                  {item.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const show = submitted;
                    const correct = oi === item.correct;
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                          show && correct
                            ? "border-emerald-500/60 bg-emerald-500/10"
                            : show && selected && !correct
                              ? "border-rose-500/50 bg-rose-500/10"
                              : selected
                                ? "border-violet-400 bg-violet-500/10"
                                : "border-transparent hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          className="mt-0.5 accent-violet-600"
                          checked={selected}
                          disabled={submitted}
                          onChange={() => {
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[qi] = oi;
                              return next;
                            });
                          }}
                        />
                        <span className="text-slate-755 dark:text-slate-300">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {!loadingQuiz && !quizError && (
              !submitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={answers.some((a) => a === null)}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit answers
                </button>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-950/30">
                  <p className="font-display text-xl font-bold text-emerald-800 dark:text-emerald-200">
                    Your Score: {score} / {quizQuestions.length}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-300/90">
                    Check standard syllabus concepts for any weak questions.
                  </p>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="mt-4 text-xs font-bold text-violet-700 underline dark:text-violet-300"
                  >
                    Retry quiz
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function NotesPanelModal({ taskTitle, onClose }) {
  if (!taskTitle) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Quick revision</p>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Notes</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">
          <NotesContent taskTitle={taskTitle} />
        </div>
      </div>
    </div>
  );
}
