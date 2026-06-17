import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NOTE_TYPES = [
  { id: "Short Notes", label: "Short Notes", icon: "📄" },
  { id: "Detailed Notes", label: "Detailed Notes", icon: "📚" },
  { id: "Revision Notes", label: "Revision Notes", icon: "⏱️" },
  { id: "Important Keywords", label: "Important Keywords", icon: "🔑" },
  { id: "Flashcards", label: "Flashcards", icon: "🎴" },
  { id: "One-page Summary", label: "One-page Summary", icon: "⚡" },
];

export default function NotesGenerator() {
  const [content, setContent] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [file, setFile] = useState(null);
  const [selectedType, setSelectedType] = useState("Short Notes");
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  
  // Interactive Flashcards state
  const [flashcards, setFlashcards] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setHasApiKey(data.hasApiKey);
        if (!data.hasApiKey) {
          setError("Connect your AI API key in Settings to activate StudyAI.");
        }
      } catch (e) {
        setHasApiKey(false);
        setError("Failed to fetch settings from backend.");
      }
    };
    checkConfig();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file && !manualNotes.trim()) {
      setError("Please provide some source text, upload a file, or write manual notes.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess("");
    setGeneratedNotes("");
    setFlashcards([]);
    setIsFlipped(false);
    setActiveCardIndex(0);

    const formData = new FormData();
    if (content) formData.append("content", content);
    if (manualNotes) formData.append("manualNotes", manualNotes);
    if (file) formData.append("file", file);
    formData.append("noteType", selectedType);

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate notes. Please check settings.");
      }

      const data = await res.json();
      setGeneratedNotes(data.notes);
      setSuccess("Notes generated successfully!");
      if (data.error) {
        setError(`⚠️ Live API Fallback Active: ${data.error}. Running in Simulated AI Mode.`);
      }

      // If the selected format is Flashcards, let's parse them
      if (selectedType === "Flashcards") {
        parseFlashcards(data.notes);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during note generation.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse flashcards in the format of Question/Answer
  const parseFlashcards = (text) => {
    const cards = [];
    const blockRegex = /\*\*Question\*\*:\s*([\s\S]*?)\n\s*\*\*Answer\*\*:\s*([\s\S]*?)(?=\n\n\*\*Question\*\*|$)/gi;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
      cards.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }

    // Fallback if formatting differed slightly
    if (cards.length === 0) {
      const simpleLines = text.split("\n\n");
      simpleLines.forEach(line => {
        if (line.toLowerCase().includes("q:") || line.toLowerCase().includes("question:")) {
          const parts = line.split(/\n(?:a|answer):/i);
          if (parts.length >= 2) {
            cards.push({
              question: parts[0].replace(/^(?:q|question):\s*/i, "").trim(),
              answer: parts[1].trim(),
            });
          }
        }
      });
    }

    setFlashcards(cards);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedNotes);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const downloadAsMarkdown = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([generatedNotes], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${selectedType.replace(/\s+/g, "_")}_StudyAI.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setSuccess("Markdown file download started!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Helper to format text with bullets and bold headers in preview
  const formatOutputHtml = (text) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return <h3 key={idx} className="font-display text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{trimmed.slice(2)}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h4 key={idx} className="font-display text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">{trimmed.slice(3)}</h4>;
      }
      if (trimmed.startsWith("### ")) {
        return <h5 key={idx} className="font-display text-sm font-bold text-slate-700 dark:text-slate-300 mt-2 mb-1">{trimmed.slice(4)}</h5>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return <li key={idx} className="ml-4 list-disc text-sm text-slate-600 dark:text-slate-350 py-0.5" dangerouslySetInnerHTML={{ __html: content }} />;
      }
      if (trimmed.match(/^\d+\.\s/)) {
        const content = trimmed.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return <li key={idx} className="ml-4 list-decimal text-sm text-slate-600 dark:text-slate-350 py-0.5" dangerouslySetInnerHTML={{ __html: content }} />;
      }
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      const content = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">AI Notes Generator</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Transform your raw learning material, documents, or lecture transcripts into structured, revision-ready materials.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Input & Options Form */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-6 h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Input Options */}
            <div>
              <label htmlFor="notes-content" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Paste Source Text
              </label>
              <textarea
                id="notes-content"
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste paragraph, chapters, outline or video transcripts here..."
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-900 shadow-inner outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white resize-none"
              />
            </div>

            <div>
              <label htmlFor="notes-file-upload" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Or Upload Document (.txt, .md, .pdf)
              </label>
              <div className="relative border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                <input
                  id="notes-file-upload"
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-2xl mb-1">📂</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {file ? file.name : "Drag & Drop or Click to browse"}
                </span>
                {file && (
                  <span className="text-[10px] text-slate-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes-manual" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Include Additional Manual Notes (Optional)
              </label>
              <input
                id="notes-manual"
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g. Focus on definitions, ignore chemical structures..."
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-inner outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
              />
            </div>

            {/* Note Formatting Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Notes Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NOTE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      selectedType === type.id
                        ? "border-violet-500 bg-violet-600/10 text-violet-700 dark:text-violet-300"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs text-rose-700 dark:text-rose-400">
                <p>{error}</p>
                {!hasApiKey && (
                  <Link to="/settings" className="mt-1 block font-bold text-violet-600 dark:text-violet-400 hover:underline">
                    Go to Settings →
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !hasApiKey}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  Compiling Materials…
                </>
              ) : (
                "Generate Notes"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Generated Notes Display */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-3 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/10 mb-6">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Study Materials Output
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedNotes ? `${selectedType} generated successfully` : "Output ready when compilation completes"}
                </p>
              </div>
              
              {generatedNotes && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadAsMarkdown}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
                  >
                    💾 Download .md
                  </button>
                </div>
              )}
            </div>

            {success && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                {success}
              </div>
            )}

            {/* Generated results container */}
            <div className="overflow-y-auto max-h-[60vh] pr-1">
              {!generatedNotes && !loading && (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 max-w-sm mx-auto">
                  <span className="text-4xl mb-4">📝</span>
                  <h4 className="font-display text-sm font-bold text-slate-700 dark:text-slate-300">No generated materials yet</h4>
                  <p className="mt-1.5 text-xs">
                    Paste raw text or upload a text file, choose your desired summary layout, and click generate notes to begin.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-600" />
                    <span className="absolute text-xs animate-pulse">✨</span>
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-800 dark:text-white">Synthesizing Notes</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">StudyAI is summarizing and structuring the text...</p>
                  </div>
                </div>
              )}

              {generatedNotes && selectedType !== "Flashcards" && (
                <div className="space-y-2 dark:text-slate-300 animate-slide-up text-left">
                  {formatOutputHtml(generatedNotes)}
                </div>
              )}

              {/* Special interactive Flashcards container */}
              {generatedNotes && selectedType === "Flashcards" && flashcards.length > 0 && (
                <div className="space-y-6 py-4 animate-slide-up">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Card {activeCardIndex + 1} of {flashcards.length}
                    </span>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-bold"
                    >
                      Flip Card
                    </button>
                  </div>

                  {/* Flippable card body */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer group relative h-60 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-tr from-slate-50 to-indigo-50/20 p-6 flex flex-col items-center justify-center text-center shadow-md dark:from-slate-900 dark:to-indigo-950/20 transition-all duration-300 hover:border-violet-500/40"
                  >
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold uppercase text-violet-600 tracking-wider">Question</span>
                        <p className="font-display text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                          {flashcards[activeCardIndex]?.question}
                        </p>
                        <p className="text-[10px] text-slate-400 italic mt-4">Click to show answer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Answer</span>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {flashcards[activeCardIndex]?.answer}
                        </p>
                        <p className="text-[10px] text-slate-400 italic mt-4">Click to show question</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
                    >
                      ← Previous Card
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
