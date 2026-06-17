import { useEffect, useState } from "react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [status, setStatus] = useState("Checking...");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load configuration from backend
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Could not fetch configurations from server.");
      const data = await res.json();
      setHasApiKey(data.hasApiKey);
      setModel(data.model || "gemini-2.5-flash");
      setStatus(data.status);
      setMaskedKey(data.maskedKey || "");
      setSimulatedMode(data.maskedKey === "SIMULATED_ACTIVE" || data.status.toLowerCase().includes("simulated"));
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setError(null);

    const keyToSend = apiKey.trim() || (hasApiKey ? "PRESERVE_EXISTING" : "");

    if (!simulatedMode && !keyToSend) {
      setError("Please enter an API Key or enable Simulated AI Mode.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: model.trim(),
          simulatedMode: simulatedMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update configurations.");
      }

      const result = await res.json();
      if (result.success) {
        setSuccessMsg(
          simulatedMode
            ? "Simulated AI Mode enabled successfully (No API quota required)!"
            : "Settings updated and live API connection verified successfully!"
        );
        setApiKey("");
        fetchConfig();
      } else {
        setStatus(result.status);
        setError(result.error || "Connection failed. Please check your API key.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up text-left">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Configure your AI integration variables. Run live using a Gemini key or enable Simulated AI mode for free unlimited usage.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Connection Status Card */}
        <div className="glass-card rounded-2xl p-6 md:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Connection Status
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status.includes("Connected") ? "bg-emerald-400" : status === "Checking..." ? "bg-amber-400" : "bg-rose-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  status.includes("Connected") ? "bg-emerald-500" : status === "Checking..." ? "bg-amber-500" : "bg-rose-500"
                }`}></span>
              </span>
              <p className={`font-display text-base font-bold ${
                status.includes("Connected") ? "text-emerald-600 dark:text-emerald-400" : status === "Checking..." ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {status}
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {status.includes("Connected")
                ? "StudyAI is active. Responses will generate instantly."
                : status === "Checking..."
                ? "Verifying connection parameters..."
                : "Unable to process requests. Please configure key or toggle Simulated mode."}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 text-xs text-rose-700 dark:text-rose-300 break-words">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Configurations Form */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white mb-6">
            API Configurations
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Simulated Toggle */}
            <div className="flex items-start gap-3 rounded-xl border border-violet-500/15 bg-violet-650/5 p-4 dark:border-violet-500/10 dark:bg-violet-950/10">
              <input
                id="toggle-simulated"
                type="checkbox"
                checked={simulatedMode}
                onChange={(e) => setSimulatedMode(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900"
              />
              <div>
                <label htmlFor="toggle-simulated" className="block text-xs font-bold text-slate-900 dark:text-white">
                  Enable Simulated AI Mode (Free / Demo)
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bypasses Gemini API request quotas. High-quality academic mock data will generate instantly for Doubt Solver, Notes, and the Planner.
                </p>
              </div>
            </div>

            {!simulatedMode && (
              <>
                <div>
                  <label htmlFor="settings-api-key" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    id="settings-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={hasApiKey ? `${maskedKey} (Enter new key to change)` : "API Key..."}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    Gemini API credentials are required for live study recommendations.
                  </p>
                </div>

                <div>
                  <label htmlFor="settings-model" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    AI Model
                  </label>
                  <input
                    id="settings-model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gemini-2.5-flash"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    Specify the model target. Default is <code>gemini-2.5-flash</code>.
                  </p>
                </div>
              </>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                {successMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                    Saving Configuration…
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
