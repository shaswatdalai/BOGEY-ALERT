const S = {
  CRITICAL: { tag:"bg-red-500/10 border border-red-500/30 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]",        score:"#ef4444", ind:"rgba(239,68,68,0.15)" },
  HIGH:     { tag:"bg-orange-500/10 border border-orange-500/30 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]",     score:"#f97316", ind:"rgba(249,115,22,0.15)" },
  MEDIUM:   { tag:"bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",   score:"#eab308", ind:"rgba(234,179,8,0.15)" },
  LOW:      { tag:"bg-blue-500/10 border border-blue-500/30 text-blue-400",       score:"#3b82f6", ind:"rgba(59,130,246,0.15)" },
  NORMAL:   { tag:"bg-emerald-500/10 border border-emerald-500/30 text-emerald-400", score:"#10b981", ind:"rgba(16,185,129,0.15)" },
};

export default function ActivityFeed({ alerts }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/50">Activity Feed</span>
        </div>
        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-0.5 font-mono text-xs font-semibold text-white/50">
          {alerts.length} events
        </span>
      </div>
      {alerts.length === 0 ? (
        <div className="py-8 text-center text-sm text-white/30 italic">
          No activity yet — run an analysis or click a quick scenario above
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          {alerts.map((a, i) => {
            const s = S[a.level] || S.NORMAL;
            const hasRag = a.ragExplanation && a.ragExplanation.length > 0;
            return (
              <div key={i} className="-mx-2 rounded-lg px-2 py-3 transition hover:bg-white/5"
                style={{ animation: i === 0 ? "feedIn 0.3s ease" : undefined }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold border border-white/5"
                    style={{ background: s.ind, color: s.score }}>{a.score}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white/90">{a.emp}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.tag}`}>{a.level}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-white/40">
                      {a.files} files @ {a.hr}:00 · {a.sens} sensitive · {a.mb} MB
                    </div>
                    {/* NEW: RAG & AI Interrogation Verdict Explanation Card */}
                    {hasRag && (
                      <div className={`mt-2 rounded-xl p-3 border transition-all ${
                        a.ragExplanation.includes("REJECTED") 
                          ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]" 
                          : a.ragExplanation.includes("ACCEPTED")
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "bg-luxury-blue/10 border-luxury-blue/20 text-luxury-blue/90"
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-sm">
                            {a.ragExplanation.includes("REJECTED") ? "🔒" : a.ragExplanation.includes("ACCEPTED") ? "✅" : "📋"}
                          </span>
                          <div className="flex-1">
                            {a.ragExplanation.includes("REJECTED") && (
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1">
                                <span>🚨 WORKSTATION LOCKED & FILE QUARANTINED</span>
                              </div>
                            )}
                            {a.ragExplanation.includes("ACCEPTED") && (
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                                <span>✅ JUSTIFICATION ACCEPTED - RISKS RESOLVED</span>
                              </div>
                            )}
                            <span className="text-[11px] font-medium leading-relaxed block opacity-90">
                              {a.ragExplanation}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono text-lg font-bold" style={{ color: s.score }}>{a.score}</div>
                    <div className="text-[10px] text-white/30">{a.time}</div>
                  </div>
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