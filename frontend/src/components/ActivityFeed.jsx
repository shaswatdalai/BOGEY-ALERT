const S = {
  CRITICAL: { tag:"bg-red-50 text-red-600",        score:"#E24B4A", ind:"#FCEBEB" },
  HIGH:     { tag:"bg-amber-50 text-amber-700",     score:"#D97706", ind:"#FFFBEB" },
  MEDIUM:   { tag:"bg-yellow-50 text-yellow-700",   score:"#B45309", ind:"#FEF3C7" },
  LOW:      { tag:"bg-blue-50 text-blue-700",       score:"#1D4ED8", ind:"#EFF6FF" },
  NORMAL:   { tag:"bg-emerald-50 text-emerald-700", score:"#065F46", ind:"#ECFDF5" },
};

export default function ActivityFeed({ alerts }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Feed</span>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 font-mono text-xs font-semibold text-slate-400">
          {alerts.length} events
        </span>
      </div>
      {alerts.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No activity yet — run an analysis or click a quick scenario above
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {alerts.map((a, i) => {
            const s = S[a.level] || S.NORMAL;
            return (
              <div key={i} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50"
                style={{ animation: i === 0 ? "feedIn 0.3s ease" : undefined }}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold"
                  style={{ background: s.ind, color: s.score }}>{a.score}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{a.emp}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.tag}`}>{a.level}</span>
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                    {a.files} files @ {a.hr}:00 · {a.sens} sensitive · {a.mb} MB
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-lg font-bold" style={{ color: s.score }}>{a.score}</div>
                  <div className="text-[10px] text-slate-400">{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes feedIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}