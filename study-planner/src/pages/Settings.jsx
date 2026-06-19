import { useEffect, useState } from "react";

export default function Settings() {
  const [status, setStatus] = useState("Checking...");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [error, setError] = useState(null);

  // Load configuration from backend
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Could not fetch configurations from server.");
      const data = await res.json();
      setModel(data.model || "gemini-2.5-flash");
      setStatus(data.status);
      setError(data.error);
    } catch (e) {
      console.error(e);
      setStatus("Not Connected");
      setError("Failed to connect to backend server. Make sure it is running.");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-slide-up text-left">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          StudyAI runs fully active using credentials configured securely on the host server.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 shadow-xl space-y-6">
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            AI Engine Connection Status
          </h3>
          <div className="mt-4 flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status.includes("Connected") ? "bg-emerald-400" : status === "Checking..." ? "bg-amber-400" : "bg-rose-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                status.includes("Connected") ? "bg-emerald-500" : status === "Checking..." ? "bg-amber-500" : "bg-rose-500"
              }`}></span>
            </span>
            <p className={`font-display text-lg font-bold ${
              status.includes("Connected") ? "text-emerald-600 dark:text-emerald-400" : status === "Checking..." ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              {status}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Active AI Model:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{model}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Configured Remotely:</span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {status.includes("Connected") ? "Yes (Secure)" : "No"}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-300 break-words">
            <strong>Engine Error:</strong> {error}
          </div>
        )}

        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          💡 <strong>Deployment Tip:</strong> To keep this connection active in production, make sure the <code>AI_API_KEY</code> environment variable is set securely in your Render.com Web Service settings.
        </div>
      </div>
    </div>
  );
}
