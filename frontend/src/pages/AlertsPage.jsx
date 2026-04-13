import { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const STATUS_CFG = {
  open:      { label: "Open",      Icon: AlertTriangle, cls: "text-red-500 bg-red-50 border-red-200"       },
  reviewing: { label: "Reviewing", Icon: Clock,         cls: "text-amber-500 bg-amber-50 border-amber-200" },
  resolved:  { label: "Resolved",  Icon: CheckCircle,   cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  dismissed: { label: "Dismissed", Icon: XCircle,       cls: "text-slate-400 bg-slate-50 border-slate-200" },
};

const LEVEL_C = {
  CRITICAL: { bg: "#FCEBEB", text: "#E24B4A" },
  HIGH:     { bg: "#FFFBEB", text: "#D97706" },
  MEDIUM:   { bg: "#FEF3C7", text: "#B45309" },
  LOW:      { bg: "#EFF6FF", text: "#1D4ED8" },
};

const SAMPLE = [
  { id: "INC-001", emp: "EMP_003", name: "Taylor Morgan", level: "CRITICAL", score: 88, status: "open",      time: "Today 03:14",    desc: "3 AM login with 480 sensitive files accessed — 96× baseline volume" },
  { id: "INC-002", emp: "EMP_001", name: "Jordan Lee",    level: "HIGH",     score: 67, status: "reviewing", time: "Yesterday 22:51",desc: "Late-night 500 MB data transfer detected, 5× normal volume for this employee" },
  { id: "INC-003", emp: "EMP_002", name: "Sam Rivera",    level: "MEDIUM",   score: 42, status: "reviewing", time: "2 days ago",     desc: "Unusual access to 60 sensitive files at 11 PM outside normal working hours" },
  { id: "INC-004", emp: "EMP_000", name: "Alex Chen",     level: "LOW",      score: 18, status: "resolved",  time: "3 days ago",     desc: "Minor deviation — accessed 22 files vs baseline of 10, within acceptable range" },
  { id: "INC-005", emp: "EMP_003", name: "Taylor Morgan", level: "HIGH",     score: 71, status: "resolved",  time: "4 days ago",     desc: "Weekend access with large file download detected (2 GB total)" },
  { id: "INC-006", emp: "EMP_001", name: "Jordan Lee",    level: "MEDIUM",   score: 39, status: "dismissed", time: "5 days ago",     desc: "Accessed 3 sensitive documents outside normal hours — confirmed business trip" },
];

export default function AlertsPage({ liveAlerts }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [incidents, setIncidents]       = useState(SAMPLE);

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
    <div className="space-y-5 p-6">

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition
              ${statusFilter === val
                ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                ${statusFilter === val ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-400">
            No incidents in this category
          </div>
        )}

        {filtered.map((inc) => {
          const lc = LEVEL_C[inc.level] || LEVEL_C.LOW;
          const sc = STATUS_CFG[inc.status] || STATUS_CFG.open;
          const { Icon } = sc;

          return (
            <div
              key={inc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Score circle */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 font-mono text-lg font-bold"
                  style={{ borderColor: lc.text, background: lc.bg, color: lc.text }}
                >
                  {inc.score}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{inc.id}</span>
                    <span className="text-sm font-bold text-slate-800">{inc.name}</span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: lc.bg, color: lc.text }}
                    >
                      {inc.level}
                    </span>
                    <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${sc.cls}`}>
                      <Icon size={9} />
                      {sc.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{inc.desc}</p>
                  <div className="mt-1 text-[10px] text-slate-400">{inc.time}</div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-shrink-0 flex-col gap-1.5 sm:flex-row">
                  {inc.status === "open" && (
                    <>
                      <button
                        onClick={() => setStatus(inc.id, "reviewing")}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => setStatus(inc.id, "dismissed")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {inc.status === "reviewing" && (
                    <button
                      onClick={() => setStatus(inc.id, "resolved")}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Resolve
                    </button>
                  )}
                  {(inc.status === "resolved" || inc.status === "dismissed") && (
                    <button
                      onClick={() => setStatus(inc.id, "open")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:bg-slate-100"
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
