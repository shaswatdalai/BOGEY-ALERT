import { useEffect, useState } from "react";
import { Activity, Lock } from "lucide-react";
import { checkHealth } from "../api/threatApi";

export default function Header({ threatScore, scoreColor }) {
  const [time, setTime]     = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const [apiOnline, setApi] = useState(null);

  useEffect(() => {
    const t = setInterval(() => { setTime(new Date()); setUptime((u) => u + 1); }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ping = async () => {
      try { await checkHealth(); setApi(true); }
      catch { setApi(false); }
    };
    ping();
    const t = setInterval(ping, 6000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const h = pad(Math.floor(uptime / 3600));
  const m = pad(Math.floor((uptime % 3600) / 60));
  const s = pad(uptime % 60);

  const circ   = 283;
  const offset = circ - (threatScore / 100) * circ;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5"
      style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E293B 40%,#0F3460 100%)" }}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(83,74,183,0.35) 0%,transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-40px] left-[40%] h-52 w-52 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)" }} />

      <div className="relative z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <span className="h-px w-5 bg-blue-400" />Security Operations Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Insider <span className="text-blue-400">Threat</span> Detection
          </h1>
          <p className="mt-1 text-sm text-white/40">Privacy-preserving AI behavioral analysis engine</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />System Active
            </span>
            <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
              ${apiOnline === true ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
              : apiOnline === false ? "border-red-400/25 bg-red-400/10 text-red-400"
              : "border-white/10 bg-white/5 text-white/40"}`}>
              <Activity size={10} />
              {apiOnline === true ? "API Connected" : apiOnline === false ? "API Offline — local scoring" : "Checking API…"}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <Lock size={10} />Privacy Preserving
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono text-xl font-semibold text-white">
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
            <div className="mt-2 font-mono text-[10px] text-white/25">UPTIME {h}:{m}:{s}</div>
          </div>
          <div className="relative h-24 w-24 flex-shrink-0">
            <svg className="-rotate-90" width="96" height="96" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1),stroke 0.4s" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold leading-none text-white">{threatScore}</span>
              <span className="mt-0.5 text-[9px] uppercase tracking-widest text-white/40">Threat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}