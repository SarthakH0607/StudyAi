/** Flat vector-style illustrations — consistent blue/purple palette */

export function IllustrationAI({ className = "w-full h-auto max-h-40" }) {
  return (
    <svg className={className} viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ai-bg" x1="0" y1="0" x2="200" y2="180">
          <stop stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="ai-core" x1="60" y1="40" x2="140" y2="140">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="200" height="180" rx="24" fill="url(#ai-bg)" />
      <circle cx="100" cy="88" r="48" fill="url(#ai-core)" opacity="0.9" />
      <circle cx="88" cy="78" r="8" fill="white" opacity="0.95" />
      <circle cx="112" cy="78" r="8" fill="white" opacity="0.95" />
      <path d="M82 98 Q100 108 118 98" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <rect x="40" y="145" width="120" height="8" rx="4" fill="#6366f1" opacity="0.5" />
      <circle cx="100" cy="40" r="6" fill="#fbbf24" opacity="0.9" />
      <path d="M100 34 L100 22 M92 28 L108 28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationStudent({ className = "w-full h-auto max-h-40" }) {
  return (
    <svg className={className} viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="stu-desk" x1="0" y1="120" x2="200" y2="180">
          <stop stopColor="#1e293b" stopOpacity="0.15" />
          <stop offset="1" stopColor="#4f46e5" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="200" height="180" rx="24" fill="url(#stu-desk)" />
      <ellipse cx="100" cy="155" rx="70" ry="12" fill="#64748b" opacity="0.2" />
      <rect x="50" y="100" width="100" height="50" rx="6" fill="#e2e8f0" className="dark:fill-slate-600" />
      <rect x="58" y="108" width="84" height="6" rx="2" fill="#3b82f6" opacity="0.6" />
      <rect x="58" y="120" width="50" height="6" rx="2" fill="#8b5cf6" opacity="0.5" />
      <circle cx="100" cy="65" r="22" fill="#fcd34d" />
      <path d="M78 72 Q100 55 122 72 L118 95 Q100 88 82 95 Z" fill="#6366f1" />
      <rect x="72" y="92" width="56" height="40" rx="8" fill="#818cf8" />
    </svg>
  );
}

export function IllustrationProductivity({ className = "w-full h-auto max-h-32" }) {
  return (
    <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" rx="16" fill="rgb(99 102 241 / 0.08)" className="dark:fill-violet-500/10" />
      <rect x="24" y="60" width="24" height="44" rx="4" fill="url(#bar1)" opacity="0.9" />
      <rect x="64" y="40" width="24" height="64" rx="4" fill="url(#bar2)" opacity="0.9" />
      <rect x="104" y="50" width="24" height="54" rx="4" fill="url(#bar1)" opacity="0.7" />
      <rect x="144" y="32" width="24" height="72" rx="4" fill="url(#bar2)" opacity="0.85" />
      <circle cx="170" cy="24" r="14" fill="#22c55e" opacity="0.85" />
      <path d="M165 24 L169 28 L177 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AvatarOrb({ className = "w-14 h-14" }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 opacity-60 blur-md animate-pulse-glow" />
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg ring-2 ring-white/30 dark:ring-white/10">
        <svg className="h-1/2 w-1/2 text-white" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
          <circle cx="16" cy="12" r="5" opacity="0.95" />
          <path d="M8 28c0-6 4-9 8-9s8 3 8 9" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
