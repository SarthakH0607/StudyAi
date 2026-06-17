export function DarkModeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex h-10 w-[4.5rem] items-center rounded-full border border-slate-200/80 bg-white/70 px-1 shadow-sm backdrop-blur-sm transition hover:border-indigo-300/50 dark:border-white/10 dark:bg-white/10"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs shadow-md transition-transform duration-300 ease-out ${
          dark
            ? "translate-x-[2.15rem] from-indigo-500 to-violet-600 text-white"
            : "translate-x-0 from-amber-400 to-orange-500 text-white"
        }`}
      >
        {dark ? "🌙" : "☀️"}
      </span>
      <span className="pointer-events-none flex w-full justify-between px-2.5 text-[10px] opacity-40 dark:opacity-30">
        <span>Light</span>
        <span>Dark</span>
      </span>
    </button>
  );
}
