const SCENARIOS = [
  { key:"normal",     label:"Normal activity",       sub:"09:00 · 10 files · 50 MB",   icon:"✓", cls:"border-emerald-200 text-emerald-800 hover:bg-emerald-50", iconBg:"bg-emerald-100", values:{hr:9,  files:10,  sens:2,   mb:50}   },
  { key:"warning",    label:"Off-hours access",       sub:"23:00 · 80 files · 800 MB",  icon:"!", cls:"border-amber-200 text-amber-900 hover:bg-amber-50",       iconBg:"bg-amber-100",   values:{hr:23, files:80,  sens:60,  mb:800}  },
  { key:"suspicious", label:"Critical exfiltration",  sub:"03:00 · 500 files · 5 GB",  icon:"⚠", cls:"border-red-200 text-red-900 hover:bg-red-50",             iconBg:"bg-red-100",     values:{hr:3,  files:500, sens:150, mb:5000} },
];

export default function QuickScenarios({ onScenario }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Scenarios</span>
      </div>
      <div className="flex flex-col gap-3">
        {SCENARIOS.map((s) => (
          <button key={s.key} onClick={() => onScenario(s.values)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 hover:translate-x-1 ${s.cls}`}>
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${s.iconBg}`}>
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="mt-0.5 font-mono text-xs opacity-60">{s.sub}</div>
            </div>
            <span className="text-base opacity-30">→</span>
          </button>
        ))}
      </div>
      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
        Clicking a scenario pre-fills the analyzer and immediately runs the risk analysis. Results appear in the left panel and activity feed.
      </p>
    </div>
  );
}