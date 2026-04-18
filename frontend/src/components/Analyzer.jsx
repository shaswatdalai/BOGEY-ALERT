import { useState, forwardRef, useImperativeHandle } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { detectThreat } from "../api/threatApi.js";
import RiskResult from "./RiskResult";

const BASELINES = {
  EMP_000: { files: 10, hour: 9, mb: 50 },
  EMP_001: { files: 15, hour: 10, mb: 80 },
  EMP_002: { files: 8, hour: 9, mb: 40 },
  EMP_003: { files: 5, hour: 9, mb: 20 },
};

// ✅ keep logic SAME but rename function properly
export function calcLocal(emp, hour, files, sens, mb) {
  const bl = BASELINES[emp] || BASELINES.EMP_000;

  let score = 0;

  const offHours = hour < 6 || hour > 21 ? 1 : 0;
  const deepNight = hour >= 0 && hour < 5 ? 1 : 0;

  const tScore = Math.min(100, offHours * 35 + deepNight * 25);
  score += tScore;

  const fr = files / Math.max(bl.files, 1);

  const vScore = Math.min(
    100,
    fr > 20 ? 35 :
    fr > 10 ? 25 :
    fr > 5 ? 15 :
    fr > 2 ? 8 : 2
  );

  score += vScore;

  const sr = files > 0 ? sens / files : 0;

  const sScore = Math.min(
    100,
    sr > 0.7 ? 20 :
    sr > 0.5 ? 13 :
    sr > 0.3 ? 7 : 2
  );

  score += sScore;

  const dr = mb / Math.max(bl.mb, 1);

  const bScore = Math.min(
    100,
    dr > 50 ? 20 :
    dr > 20 ? 14 :
    dr > 5 ? 8 :
    dr > 2 ? 4 : 1
  );

  score += bScore;

  score = Math.min(100, Math.round(score));

  let level, action, color, bgColor;

  if (score >= 80) {
    level = "CRITICAL";
    action = "Immediate account suspension recommended";
    color = "#E24B4A";
    bgColor = "#FCEBEB";
  } 
  else if (score >= 60) {
    level = "HIGH";
    action = "Escalate to security team immediately";
    color = "#D97706";
    bgColor = "#FFFBEB";
  } 
  else if (score >= 35) {
    level = "MEDIUM";
    action = "Flag for security review within 24 hours";
    color = "#B45309";
    bgColor = "#FEF3C7";
  } 
  else if (score >= 15) {
    level = "LOW";
    action = "Log event and monitor closely";
    color = "#1D4ED8";
    bgColor = "#EFF6FF";
  } 
  else {
    level = "NORMAL";
    action = "No action required — within normal parameters";
    color = "#065F46";
    bgColor = "#ECFDF5";
  }

  return {
    score,
    level,
    action,
    color,
    bgColor,
    tScore,
    vScore,
    sScore,
    bScore,
  };
}

const iCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

const lCls =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400";


// ✅ React Component (default export)
const Analyzer = forwardRef(function Analyzer({ onResult }, ref) {

  const [form, setForm] = useState({
    emp: "EMP_000",
    hr: 9,
    files: 10,
    sens: 2,
    mb: 50,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoad] = useState(false);

  const set = (k, v) =>
    setForm((f) => ({ ...f, [k]: v }));


  async function analyze(overrides = {}) {

    const f = { ...form, ...overrides };

    setForm(f);
    setLoad(true);

    const local = calcLocal(
      f.emp,
      Number(f.hr),
      Number(f.files),
      Number(f.sens),
      Number(f.mb)
    );

    let res = {
      ...local,
      hr: f.hr,
      files: f.files,
      sens: f.sens,
      mb: f.mb,
      emp: f.emp,
    };

    try {

      const data = await detectThreat({
        employee_id: f.emp,
        login_hour: Number(f.hr),
        files_accessed: Number(f.files),
        sensitive_files: Number(f.sens),
        data_mb: Number(f.mb),
      });

      res = {
        ...res,
        score: data.risk_score,
        level: data.risk_level,
        action: data.recommended_action,
      };

    } catch {}

    setResult(res);
    onResult?.(res);

    setLoad(false);
  }


  useImperativeHandle(ref, () => ({
    runWithValues: (v) => analyze(v),
  }));


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Behavioral Analyzer
        </span>
      </div>

      <div className="space-y-3">

        <div>
          <label className={lCls}>Employee ID</label>

          <select
            className={iCls}
            value={form.emp}
            onChange={(e) => set("emp", e.target.value)}
          >

            <option value="EMP_000">EMP_000 — Engineer</option>
            <option value="EMP_001">EMP_001 — Manager</option>
            <option value="EMP_002">EMP_002 — Analyst</option>
            <option value="EMP_003">EMP_003 — Intern</option>

          </select>
        </div>


        <div className="grid grid-cols-2 gap-3">

          {[
            ["Login Hour (0–23)", "hr", 0, 23],
            ["Files Accessed", "files", 0, null],
            ["Sensitive Files", "sens", 0, null],
            ["Data Volume (MB)", "mb", 0, null],
          ].map(([label, key, min, max]) => (

            <div key={key}>

              <label className={lCls}>{label}</label>

              <input
                type="number"
                className={iCls}
                min={min}
                max={max ?? undefined}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />

            </div>
          ))}
        </div>


        <button
          onClick={() => analyze()}
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
        >

          {loading && <Loader2 size={15} className="animate-spin" />}

          {loading ? "Analyzing…" : "Run Risk Analysis"}

          {!loading && <ArrowRight size={14} />}

        </button>

      </div>

      <RiskResult result={result} />

    </div>
  );
});

export default Analyzer;
