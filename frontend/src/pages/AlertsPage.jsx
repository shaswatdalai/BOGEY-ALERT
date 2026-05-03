import { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const STATUS_CFG = {
  open:      { label: "Open",      Icon: AlertTriangle, cls: "text-red-400 bg-red-500/10 border-red-500/20"       },
  reviewing: { label: "Reviewing", Icon: Clock,         cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  resolved:  { label: "Resolved",  Icon: CheckCircle,   cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  dismissed: { label: "Dismissed", Icon: XCircle,       cls: "text-white/40 bg-white/5 border-white/10" },
};

const LEVEL_C = {
  CRITICAL: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  HIGH:     { bg: "rgba(249,115,22,0.15)", text: "#f97316" },
  MEDIUM:   { bg: "rgba(234,179,8,0.15)", text: "#eab308" },
  LOW:      { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
};

const SAMPLE = [
  { id: "INC-001", emp: "EMP_003", name: "Taylor Morgan", level: "CRITICAL", score: 88, status: "open",      time: "Today 03:14",    desc: "3 AM login with 480 sensitive files accessed — 96× baseline volume", ragExplanation: "Employee accessed 480 files at 3 AM. Normal baseline is 5 files. Files contain customer PII. Policy P-12 prohibits bulk downloads outside business hours." },
  { id: "INC-002", emp: "EMP_001", name: "Jordan Lee",    level: "HIGH",     score: 67, status: "reviewing", time: "Yesterday 22:51",desc: "Late-night 500 MB data transfer detected, 5× normal volume for this employee", ragExplanation: "Data transfer of 500 MB at 11 PM. Employee role requires prior approval for after-hours transfers. No approval found." },
  { id: "INC-003", emp: "EMP_002", name: "Sam Rivera",    level: "MEDIUM",   score: 42, status: "reviewing", time: "2 days ago",     desc: "Unusual access to 60 sensitive files at 11 PM outside normal working hours", ragExplanation: null },
  { id: "INC-004", emp: "EMP_000", name: "Alex Chen",     level: "LOW",      score: 18, status: "resolved",  time: "3 days ago",     desc: "Minor deviation — accessed 22 files vs baseline of 10, within acceptable range", ragExplanation: null },
  { id: "INC-005", emp: "EMP_003", name: "Taylor Morgan", level: "HIGH",     score: 71, status: "resolved",  time: "4 days ago",     desc: "Weekend access with large file download detected (2 GB total)", ragExplanation: "Weekend access with 2GB download. Employee had prior approval for weekend project work. Marked as resolved." },
  { id: "INC-006", emp: "EMP_001", name: "Jordan Lee",    level: "MEDIUM",   score: 39, status: "dismissed", time: "5 days ago",     desc: "Accessed 3 sensitive documents outside normal hours — confirmed business trip", ragExplanation: "Employee was on approved business trip. Access related to client presentation. Dismissed." },
];

export default function AlertsPage({ liveAlerts }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [incidents, setIncidents]       = useState(SAMPLE);
  const [expandedRag, setExpandedRag] = useState({});

  // Toggle RAG explanation expansion
  const toggleRag = (id) => {
    setExpandedRag(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Merge high/critical live alerts from the dashboard session
  const liveIncidents = liveAlerts
    .filter((a) => ["CRITICAL", "HIGH"].includes(a.level))
    .map((a, i) => ({
      id:     `LIVE-${i + 1}`,
      emp:    a.emp,
      name:   a.emp,
      level:  a.level,
      score:  a.score,
      desc:   `${a.files} files accessed at ${a.hr}:00 · ${a.mb} MB transferred · ${a.sens} sensitive files`,
      time:   a.time,
      status: "open",
      ragExplanation: a.ragExplanation || null,
    }));

  const all      = [...liveIncidents, ...incidents];
  const filtered = statusFilter === "all" ? all : all.filter((a) => a.status === statusFilter);

  const counts = all.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  function setStatus(id, next) {
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status: next } : inc)));
  }

  const TABS = [
    ["all",       "All",       all.length],
    ["open",      "Open",      counts.open      || 0],
    ["reviewing", "Reviewing", counts.reviewing || 0],
    ["resolved",  "Resolved",  counts.resolved  || 0],
    ["dismissed", "Dismissed", counts.dismissed || 0],
  ];

  return (
    <div className="space-y-5 p-6 animate-fade-in">

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5
              ${statusFilter === val
                ? "border-luxury-blue bg-luxury-blue/20 text-luxury-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                : "border-white/10 bg-black/40 text-white/50 hover:bg-white/5"}`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                ${statusFilter === val ? "bg-luxury-blue/30 text-white" : "bg-white/10 text-white/40"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/40 py-12 text-center text-white/50 italic shadow-lg">
            No incidents in this category
          </div>
        )}

        {filtered.map((inc) => {
          const lc = LEVEL_C[inc.level] || LEVEL_C.LOW;
          const sc = STATUS_CFG[inc.status] || STATUS_CFG.open;
          const { Icon } = sc;
          const isExpanded = expandedRag[inc.id];
          const hasRag = inc.ragExplanation && inc.ragExplanation.length > 0;

          return (
            <div
              key={inc.id}
              className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-5 transition hover:shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:border-luxury-blue/30"
            >
              <div className="flex items-start gap-4">
                {/* Score circle */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 font-mono text-lg font-bold shadow-[0_0_10px_currentColor]"
                  style={{ borderColor: lc.text, background: lc.bg, color: lc.text }}
                >
                  {inc.score}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white/40">{inc.id}</span>
                    <span className="text-sm font-bold text-white/90">{inc.name}</span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold border border-current"
                      style={{ background: lc.bg, color: lc.text }}
                    >
                      {inc.level}
                    </span>
                    <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${sc.cls}`}>
                      <Icon size={9} />
                      {sc.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/60">{inc.desc}</p>
                  
                  {/* NEW: RAG Explanation Section */}
                  {hasRag && (
                    <div className="mt-3 rounded-lg border border-luxury-blue/30 bg-luxury-blue/10 p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm">📋</span>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-luxury-blue">RAG Contextual Analysis</span>
                          <p className={`text-xs text-luxury-blue/80 mt-1 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {inc.ragExplanation}
                          </p>
                          {inc.ragExplanation.length > 150 && (
                            <button
                              onClick={() => toggleRag(inc.id)}
                              className="mt-1 text-xs font-medium text-luxury-blue hover:text-white"
                            >
                              {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 text-[10px] text-white/30">{inc.time}</div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-shrink-0 flex-col gap-1.5 sm:flex-row">
                  {inc.status === "open" && (
                    <>
                      <button
                        onClick={() => setStatus(inc.id, "reviewing")}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400 transition hover:bg-amber-500/20"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => setStatus(inc.id, "dismissed")}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/50 transition hover:bg-white/10 hover:text-white/80"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {inc.status === "reviewing" && (
                    <button
                      onClick={() => setStatus(inc.id, "resolved")}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                    >
                      Resolve
                    </button>
                  )}
                  {(inc.status === "resolved" || inc.status === "dismissed") && (
                    <button
                      onClick={() => setStatus(inc.id, "open")}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/50 transition hover:bg-white/10 hover:text-white/80"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}