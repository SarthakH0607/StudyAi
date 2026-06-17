import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const QUESTION_TYPES = [
  { id: "general", label: "General Chat", icon: "💬" },
  { id: "definition", label: "Definition Question", icon: "📖" },
  { id: "concept", label: "Concept Explanation", icon: "💡" },
  { id: "exam_prep", label: "Exam Preparation", icon: "📝" },
  { id: "coding", label: "Coding Problem", icon: "💻" },
  { id: "math", label: "Math Solution Steps", icon: "🔢" },
  { id: "revision", label: "Quick Revision Summary", icon: "⏳" },
  { id: "complex", label: "Explain Complex Topic", icon: "🧬" },
];

export default function DoubtSolver() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Check config on load
  const checkConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setHasApiKey(data.hasApiKey);
      if (!data.hasApiKey) {
        setError("Connect your AI API key in Settings to activate StudyAI.");
      }
    } catch (e) {
      console.error(e);
      setHasApiKey(false);
      setError("Failed to fetch settings from backend.");
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  // Auto Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Track weak subjects dynamically based on keywords in user prompt
  const recordWeakSubject = (promptText) => {
    const text = promptText.toLowerCase();
    let detectedSubject = null;
    
    if (text.includes("chemistry") || text.includes("organic") || text.includes("atoms") || text.includes("acid")) {
      detectedSubject = "Chemistry";
    } else if (text.includes("calculus") || text.includes("integral") || text.includes("math") || text.includes("solve") || text.includes("derivative")) {
      detectedSubject = "Mathematics";
    } else if (text.includes("history") || text.includes("war") || text.includes("revolution") || text.includes("century")) {
      detectedSubject = "History";
    } else if (text.includes("javascript") || text.includes("code") || text.includes("programming") || text.includes("python") || text.includes("react")) {
      detectedSubject = "Computer Science";
    } else if (text.includes("physics") || text.includes("force") || text.includes("gravity") || text.includes("quantum")) {
      detectedSubject = "Physics";
    }

    if (detectedSubject) {
      const saved = localStorage.getItem("studyflow_weak_subjects");
      let list = saved ? JSON.parse(saved) : [];
      if (!list.includes(detectedSubject)) {
        list.push(detectedSubject);
        localStorage.setItem("studyflow_weak_subjects", JSON.stringify(list));
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Dynamic weak subject update
    recordWeakSubject(input);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          type: selectedType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      if (data.error) {
        setError(`⚠️ Live API Fallback Active: ${data.error}. Running in Simulated AI Mode.`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check settings or try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSamplePrompt = (text, type) => {
    setInput(text);
    setSelectedType(type);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    checkConfig();
  };

  // Helper to parse markdown-like code block highlights
  const renderMessageContent = (text) => {
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.slice(lastIndex, match.index)}</span>);
      }
      const lang = match[1] || "code";
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-4 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-mono text-sm shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/70 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <span>{lang.toUpperCase()}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Copy
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-slate-800 dark:text-slate-300">
            <code>{code}</code>
          </pre>
        </div>
      );
      lastIndex = codeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Question Type Side Panel */}
      <div className="glass-card rounded-2xl p-5 lg:col-span-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Doubt Solver Mode
          </h3>
          <div className="space-y-1.5 overflow-y-auto max-h-[40vh] pr-1">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  selectedType === type.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200/60 pt-4 dark:border-white/10">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            🧹 Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-card rounded-2xl flex flex-col lg:col-span-3 overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-slate-200/60 bg-white/50 px-6 py-4 dark:border-white/10 dark:bg-white/5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              StudyAI Tutor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Session — Adapts formatting to {QUESTION_TYPES.find(q => q.id === selectedType)?.label}
            </p>
          </div>
          {!hasApiKey && (
            <Link
              to="/settings"
              className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20"
            >
              ⚠️ Missing API Key
            </Link>
          )}
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-400 flex flex-col gap-2">
              <p>{error}</p>
              {!hasApiKey && (
                <Link
                  to="/settings"
                  className="w-fit text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
                >
                  Go to Settings →
                </Link>
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-10 space-y-6">
              <span className="text-4xl">🎓</span>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Ask StudyAI</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ask definitions, complex concepts, coding errors, math steps, or quick summaries. Selected Mode adjusts response styles automatically.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 w-full pt-4">
                <button
                  onClick={() => loadSamplePrompt("What is a double covalent bond in chemistry?", "definition")}
                  className="rounded-xl border border-slate-200 bg-white/50 p-4 text-left text-xs font-medium text-slate-600 transition hover:border-violet-400/50 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  🧪 <strong>Definition:</strong> Double Covalent Bond
                </button>
                <button
                  onClick={() => loadSamplePrompt("How does Merge Sort work? Provide code and complexity.", "coding")}
                  className="rounded-xl border border-slate-200 bg-white/50 p-4 text-left text-xs font-medium text-slate-600 transition hover:border-violet-400/50 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  💻 <strong>Coding:</strong> Merge Sort logic
                </button>
                <button
                  onClick={() => loadSamplePrompt("Find the derivative of f(x) = x^2 * sin(x)", "math")}
                  className="rounded-xl border border-slate-200 bg-white/50 p-4 text-left text-xs font-medium text-slate-600 transition hover:border-violet-400/50 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  🔢 <strong>Math:</strong> Derivative calculation
                </button>
                <button
                  onClick={() => loadSamplePrompt("Explain photosythesis in simple terms using plant analogies", "complex")}
                  className="rounded-xl border border-slate-200 bg-white/50 p-4 text-left text-xs font-medium text-slate-600 transition hover:border-violet-400/50 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  🧬 <strong>Complex:</strong> Photosynthesis analogy
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow">
                    AI
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white font-medium shadow-md shadow-violet-600/10"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 shadow-sm"
                  }`}
                >
                  {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow animate-pulse">
                AI
              </div>
              <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200/60 bg-white/30 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !hasApiKey}
            placeholder={
              !hasApiKey
                ? "Connect API key in Settings..."
                : `Type a ${QUESTION_TYPES.find(q => q.id === selectedType)?.label.toLowerCase()}...`
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none ring-violet-500/30 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-55 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !hasApiKey}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-700 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
